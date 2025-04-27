# 🎓 AutoCred - Generate Certificates on the Fly!

**AutoCred is a FastAPI-based backend project designed to generate certificates dynamically using a template injection mechanism, supporting both single and bulk certificate generation. The generated certificates are automatically uploaded to Cloudinary for easy access and sharing.**

## 🖥️ Live Preview & Walkthrough

### 🔗 Deployed Application
[Click here to visit AutoCred Live](https://devsoc-autocred-demo.vercel.app/)

### 🎬 Demo Video
[<img src="https://res.cloudinary.com/dkdeuduec/image/upload/v1745742584/thumbnail_jbpvgk.jpg" width="225"/>](https://res.cloudinary.com/dkdeuduec/video/upload/v1745740362/demo_tb8ykh.mp4)





### 📸 Application Screenshots

| Login Page | Home Page | 
|:----------:|:---------:|
| <img src="https://res.cloudinary.com/dkdeuduec/image/upload/v1745740358/login_eeou0k.jpg" width="200"/> | <img src="https://res.cloudinary.com/dkdeuduec/image/upload/v1745740358/home_a8oats.jpg" width="200"/> |

| Progress Bar | Success Modal |
|:-------------:|:-------------:|
| <img src="https://res.cloudinary.com/dkdeuduec/image/upload/v1745740359/progress_qfqego.jpg" width="200"/> | <img src="https://res.cloudinary.com/dkdeuduec/image/upload/v1745740358/success_idhqpg.jpg" width="200"/> |

| Bulk Generation | Single Certificate Generation |
|:----------------:|:-----------------------------:|
| <img src="https://res.cloudinary.com/dkdeuduec/image/upload/v1745740359/bulk_rh9vam.jpg" width="200"/> | <img src="https://res.cloudinary.com/dkdeuduec/image/upload/v1745740358/single_ojwasz.jpg" width="200"/> |


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

1. **Template Injection**: A `.docx` certificate template contains placeholders (like `{name}`, `{event}`, etc.). These placeholders are dynamically replaced with user/student-specific data.
2. **Conversion**: The customized `.docx` is converted into a `.pdf` using Spire.Doc library.
3. **Cloud Upload**: The final PDF is uploaded to Cloudinary, and a secure URL is returned for access.
4. **Progress Update**: For bulk generations, progress is tracked live using Server-Sent Events.


## 🛠️ Tech Stack

- **Backend**: FastAPI, Python
- **Authentication**: JWT (JSON Web Tokens)
- **Document Processing**: python-docx, Spire.Doc
- **Cloud Storage**: Cloudinary
- **Data Handling**: pandas, openpyxl
- **Environment Management**: python-dotenv

