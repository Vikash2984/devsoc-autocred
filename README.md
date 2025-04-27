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

<ul>
   <li>**Template Injection**: A `.docx` certificate template contains placeholders (like `{name}`, `{event}`, etc.). These placeholders are dynamically replaced with user/student-specific data.</li>
   <li>**Conversion**: The customized `.docx` is converted into a `.pdf` using Spire.Doc library.</li>
   <li>**Cloud Upload**: The final PDF is uploaded to Cloudinary, and a secure URL is returned for access.</li>
   <li>**Progress Update**: For bulk generations, progress is tracked live using Server-Sent Events.</li>

</ul>


## 🛠️ Tech Stack

- **Backend**: FastAPI, Python
- **Authentication**: JWT (JSON Web Tokens)
- **Document Processing**: python-docx, Spire.Doc
- **Cloud Storage**: Cloudinary
- **Data Handling**: pandas, openpyxl
- **Environment Management**: python-dotenv

