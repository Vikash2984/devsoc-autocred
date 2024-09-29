import os
import win32com.client

def convert_docx_to_pdf(source_folder, target_folder):
    # Initialize Word application
    word = win32com.client.Dispatch("Word.Application")
    
    # Ensure the target folder exists
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)
    
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
                    
                    # Close the document
                    doc.Close()
                    
                    print(f"Converted {file_path} to {pdf_path}")
                except Exception as e:
                    print(f"Failed to convert {file_path}: {e}")

    # Quit Word application
    word.Quit()

# Specify the source and target folder paths
# Respecify the absolute paths for the following directories based on your local machine 
source_folder = r'D:\vsCode\vcs\devsoc-autocred\docx'
target_folder = r"D:\vsCode\vcs\devsoc-autocred\Certificates"

# Convert all .docx files in the source folder to PDF and save them to the target folder
convert_docx_to_pdf(source_folder, target_folder)
