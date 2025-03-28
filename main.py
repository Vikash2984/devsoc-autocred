import os
import asyncio
import pandas as pd
import cloudinary.uploader
from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from docx import Document
from docx.shared import Pt, RGBColor
from spire.doc import Document as SpireDocument, FileFormat
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET")
)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

FONT_STYLES = {
    "{name}": Pt(26),
    "{department}": Pt(21),
    "{year}": Pt(21),
    "{event}": Pt(20.5),
    "{date}": Pt(19)
}

def upload_to_cloudinary(file_path, folder):
    result = cloudinary.uploader.upload(file_path, folder=folder, use_filename=True, unique_filename=False, resource_type="raw" if file_path.endswith("_logs.xlsx") else "auto")
    os.remove(file_path)
    return result["secure_url"]

def convert_docx_to_pdf(docx_path, name, email, event, role):
    pdf_path = f"{os.path.dirname(docx_path)}/{name}_{email}_{role}.pdf"
    doc = SpireDocument()
    doc.LoadFromFile(docx_path)
    doc.SaveToFile(pdf_path, FileFormat.PDF)
    os.remove(docx_path)
    return upload_to_cloudinary(pdf_path, f"AutoCred/{event}")

def generate_certificate(template, placeholders, output_folder, event, role):
    os.makedirs(output_folder, exist_ok=True)
    doc = Document(template)

    for paragraph in (cell.paragraphs for table in doc.tables for row in table.rows for cell in row.cells):
        for para in paragraph:
            for key, value in placeholders.items():
                if key in para.text:
                    para.text = para.text.replace(key, "")
                    run = para.add_run(value)
                    run.font.size = FONT_STYLES.get(key, Pt(21.5))
                    run.font.italic = True
                    run.font.color.rgb = RGBColor(171, 124, 52)

    docx_path = f"{output_folder}/{placeholders['{name}'].replace(' ', '_')}_{placeholders['{email}'].replace(' ', '_')}_certificate.docx"
    doc.save(docx_path)
    return convert_docx_to_pdf(docx_path, placeholders["{name}"], placeholders["{email}"], event, role)

async def process_bulk_certificates(event_name, event_date, template_path, file_path, pdf_folder, role):
    data = pd.read_excel(file_path, engine="openpyxl").to_dict(orient="records")
    log_file_path = f"{os.path.dirname(file_path)}/{event_name}_logs.xlsx"
    df = pd.DataFrame(columns=["Name", "Email", "Certificate"])

    for student in data:
        placeholders = {f'{{{k.lower()}}}': v for k, v in student.items()}
        placeholders.update({'{event}': event_name, '{date}': event_date})
        df.loc[len(df)] = [student['Name'], student['Email'], generate_certificate(template_path, placeholders, pdf_folder, event_name, role)]
        await asyncio.sleep(0.1)

    df.to_excel(log_file_path, index=False)
    return upload_to_cloudinary(log_file_path, f"AutoCred/{event_name}")

@app.post("/generate-certificates")
async def generate_certificates(
    background_tasks: BackgroundTasks,
    event_name: str = Form(...), event_date: str = Form(...), template: str = Form(...),
    gen_type: str = Form(...), file: Optional[UploadFile] = File(None), student_name: str = Form(None),
    department: str = Form(None), year: str = Form(None), email: str = Form(None)
):
    script_dir, pdf_folder = os.path.dirname(os.path.abspath(__file__)), "tmp/Certificates"
    os.makedirs(pdf_folder, exist_ok=True)
    
    role = "participant" if template == "template1" else "organizer"
    template_path = f"{script_dir}/temp{1 if template == 'template1' else 2}.docx"

    if gen_type == "single":
        placeholders = {'{name}': student_name, '{department}': department, '{year}': year, '{event}': event_name, '{date}': event_date, '{email}': email}
        return JSONResponse({"message": "Certificate generated successfully", "download_url": generate_certificate(template_path, placeholders, pdf_folder, event_name, role)})
    
    if gen_type == "bulk" and file:
        excel_path = f"{script_dir}/{file.filename}"
        with open(excel_path, "wb") as f:
            f.write(file.file.read())
        return JSONResponse({"message": "Bulk certificate generation completed", "log_file_url": await process_bulk_certificates(event_name, event_date, template_path, excel_path, pdf_folder, role)})

    return JSONResponse({"error": "Invalid generation type or missing data"}, status_code=400)
