import os
import win32com.client
import time

def convert_docx_to_pdf(source_folder, target_folder):
    # Initialize Word application
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False  # Keep Word hidden

    # Ensure the target folder exists
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)
    con_count = 0
    # Iterate through all files in the source folder
    for root, dirs, files in os.walk(source_folder):
        for file in files:
            if file.endswith('.docx'):
                file_path = os.path.join(root, file)
                try:
                    # Open the Word document
                    doc = word.Documents.Open(file_path)
                    
                    # Define the output PDF path
                    pdf_path = os.path.join(target_folder, file.replace('.docx', '.pdf'))
                    
                    # Save as PDF
                    doc.SaveAs(pdf_path, FileFormat=17)  # 17 is the PDF format
                    
                    # Close the document and add delay
                    doc.Close()
                    time.sleep(0.5)
                    
                    print(f"\nConverted {file_path} to {pdf_path}")
                    con_count += 1
                except Exception as e:
                    print(f"Failed to convert {file_path}: {e.__class__.__name__} - {e}")
    if con_count == 1:
        print(f"\n 1 certificate was converted to pdf...")
    else:
        print(f"\n{con_count} certificates were converted to pdf...")

    # Quit Word application
    word.Quit()

# Specify the source and target folder paths with absolute paths
source_folder = r'D:\vsCode\vcs\devsoc-autocred\docx'
target_folder = r'D:\vsCode\vcs\devsoc-autocred\Certificates'

# Convert all .docx files in the source folder to PDF and save them to the target folder
convert_docx_to_pdf(source_folder, target_folder)
