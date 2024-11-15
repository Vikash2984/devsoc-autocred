import os
import time
import pandas as pd
from docx import Document
from docx.shared import Pt, RGBColor
import win32com.client

# Resolve paths relative to the script's location
script_dir = os.path.dirname(os.path.abspath(__file__))

def read_student_data(excel_file):
    """
    Reads student data (name, department, and year) from an Excel file and returns a list of dictionaries.
    """
    student_data = []
    if os.path.isfile(excel_file):  # Check if file exists
        df = pd.read_excel(excel_file, engine='openpyxl')
        required_columns = ['Name', 'Email', 'Department', 'Year']
        if all(column in df.columns for column in required_columns):
            student_data = df[required_columns].astype(str).to_dict(orient='records')
        else:
            print(f"Excel file must contain the columns: {', '.join(required_columns)}")
    else:
        print(f"File not found: {excel_file}")
    return student_data

def replace_placeholder_with_format(paragraph, placeholder, replacement):
    """
    Replaces a placeholder in the paragraph with formatted replacement text.
    """
    for run in paragraph.runs:
        if placeholder in run.text:
            run.text = run.text.replace(placeholder, "")  # Remove placeholder text from this run
            new_run = paragraph.add_run(replacement)  # Add new run with the replacement text
            new_run.font.name = 'Georgia'
            new_run.font.color.rgb = RGBColor(171, 124, 52)
            new_run.font.italic = True
            if placeholder == '{name}':
                new_run.font.size = Pt(28)
            else:
                new_run.font.size = Pt(21.5)

def replace_placeholders_in_table(table, placeholders):
    """
    Replace placeholders in all cells of a table with the specified replacements.
    """
    for row in table.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                for placeholder, replacement in placeholders.items():
                    replace_placeholder_with_format(paragraph, placeholder, replacement)

def generate_certificates(template_path, docx_folder, student_data):
    """
    Generate Word certificates by replacing placeholders with student data.
    """
    if not os.path.exists(docx_folder):
        os.makedirs(docx_folder)

    total_generated = 0  # Counter for total certificates generated

    for student in student_data:
        placeholders = {
            '{name}': student['Name'],
            '{department}': student['Department'],
            '{year}': student['Year']
        }
        doc = Document(template_path)
        for table in doc.tables:
            replace_placeholders_in_table(table, placeholders)
        
        output_path = os.path.join(docx_folder, f"{student['Name']}_{student['Email']}_certificate.docx")
        doc.save(output_path)
        print(f"✔ Certificate generated: '{student['Name']}' → {output_path}\n")
        total_generated += 1

    print(f"\n✅ Total certificates generated: {total_generated}\n\n")

def convert_docx_to_pdf(source_folder, target_folder):
    """
    Converts Word documents in the source folder to PDFs in the target folder.
    """
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False  # Keep Word hidden

    if not os.path.exists(target_folder):
        os.makedirs(target_folder)

    total_converted = 0  # Counter for total PDFs converted

    for root, dirs, files in os.walk(source_folder):
        for file in files:
            if file.endswith('.docx'):
                file_path = os.path.abspath(os.path.join(root, file))  # Resolve absolute path
                try:
                    doc = word.Documents.Open(file_path)
                    pdf_path = os.path.abspath(os.path.join(target_folder, file.replace('.docx', '.pdf')))
                    doc.SaveAs(pdf_path, FileFormat=17)  # 17 is the PDF format
                    doc.Close()
                    time.sleep(0.5)
                    print(f"✔ Converted to PDF: '{file}' → {pdf_path}\n")
                    total_converted += 1
                except Exception as e:
                    print(f"❌ Failed to convert: '{file}' - {e.__class__.__name__} - {e}\n")
    word.Quit()
    print(f"\n✅ Total files converted to PDF: {total_converted}\n")

# Main Execution
template_path = os.path.join(script_dir, "template.docx")  # Use script_dir to resolve relative path
excel_file = os.path.join(script_dir, "data.xlsx")        # Use script_dir to resolve relative path
docx_folder = os.path.join(script_dir, "docx")           # Use script_dir to resolve relative path
pdf_folder = os.path.join(script_dir, "Certificates")    # Use script_dir to resolve relative path

# Generate certificates and convert them to PDF
student_data = read_student_data(excel_file)
if student_data:
    generate_certificates(template_path, docx_folder, student_data)
    convert_docx_to_pdf(docx_folder, pdf_folder)
