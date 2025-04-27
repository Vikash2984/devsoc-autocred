# 🎓 AutoCred - Generate Certificates on the Fly!

**AutoCred is a FastAPI-based backend project designed to generate certificates dynamically using a template injection mechanism, supporting both single and bulk certificate generation. The generated certificates are automatically uploaded to Cloudinary for easy access and sharing.**

## ✨ Features
<ul>
   <li>🧾 Single Certificate Generation</li>
   <li>🗃️ Bulk Certificate Generation from Excel sheets</li>
   <li>☁️ Cloud Storage of certificates on Cloudinary</li>
   <li>🔐 Secure Authentication using JWT tokens</li>
   <li>🚪 Logout Feature (Token revocation handled)</li>
   <li>📈 Real-time Progress Tracking for bulk generation</li>
   <li>📥 Downloadable Log Files containing generated certificate URLs</li>
</ul>

## 🧠 How It Works

1. **Template Injection**: Utilizes `.docx` templates containing placeholders (e.g., `{name}`, `{event}`) which are dynamically replaced with actual participant data.
2. **PDF Conversion**: Employs Spire.Doc to convert the filled `.docx` files into PDFs.
3. **Cloud Storage**: Uploads the generated PDFs to Cloudinary, providing accessible URLs for each certificate.
4. **Progress Tracking**: Implements real-time progress tracking for bulk certificate generation using Server-Sent Events (SSE).


## 🛠️ Tech Stack

- **Backend**: FastAPI, Python
- **Authentication**: JWT (JSON Web Tokens)
- **Document Processing**: python-docx, Spire.Doc
- **Cloud Storage**: Cloudinary
- **Data Handling**: pandas, openpyxl
- **Environment Management**: python-dotenv

