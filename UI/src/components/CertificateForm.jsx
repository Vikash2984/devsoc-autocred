"use client"

import { useState } from "react"
import Modal from "./Modal"

function CertificateForm() {
  const [formData, setFormData] = useState({
    event_name: "",
    event_date: "",
    template: "template1",
    gen_type: "bulk",
    file: null,
    student_name: "",
    email: "",
    department: "",
    year: "First",
  })

  const [fileName, setFileName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, file: e.target.files[0] }))
      setFileName(`File selected: ${e.target.files[0].name}`)
    } else {
      setFormData((prev) => ({ ...prev, file: null }))
      setFileName("")
    }
  }

  const formatDate = (inputDate) => {
    if (!inputDate) return ""
    const [year, month, day] = inputDate.split("-")
    return `${day}-${month}-${year}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const submitData = new FormData()

    // Add all form fields to FormData
    Object.keys(formData).forEach((key) => {
      if (key === "file" && formData.file) {
        submitData.append(key, formData.file)
      } else if (key === "event_date") {
        submitData.append(key, formatDate(formData[key]))
      } else if (key !== "file" && formData[key]) {
        submitData.append(key, formData[key])
      }
    })

    try {
      const response = await fetch("http://127.0.0.1:8000/generate-certificates", {
        method: "POST",
        body: submitData,
      })

      const result = await response.json()

      // Handle different responses based on generation type
      if (formData.gen_type === "single" && result.download_url) {
        setDownloadUrl(result.download_url)
        setShowModal(true)
      } else {
        setDownloadUrl(result.log_file_url)
        setShowModal(true)
      }
    } catch (error) {
      console.error("Error generating certificates:", error)
      alert("Error generating certificates. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setDownloadUrl("")
  }

  const renderDataIngestion = () => {
    if (formData.gen_type === "bulk") {
      return (
        <div className="file-upload">
          <label htmlFor="bulk-upload" className="file-label">
            <span>Upload your .xlsx file</span>
            <input type="file" id="bulk-upload" name="file" accept=".xlsx" onChange={handleFileChange} required />
          </label>
          <p className="file-name">{fileName}</p>
        </div>
      )
    } else {
      return (
        <>
          <div className="form-group">
            <label htmlFor="student-name">Student Name</label>
            <input
              type="text"
              id="student-name"
              name="student_name"
              value={formData.student_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="year">Academic Year</label>
            <select id="year" name="year" value={formData.year} onChange={handleChange} required>
              <option value="First">First</option>
              <option value="Second">Second</option>
              <option value="Third">Third</option>
              <option value="Fourth">Fourth</option>
            </select>
          </div>
        </>
      )
    }
  }

  return (
    <>
      <section className="form-section">
        <form id="certificate-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="event-name">Event Name</label>
            <input
              type="text"
              id="event-name"
              name="event_name"
              value={formData.event_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="event-date">Event Date</label>
            <input
              type="date"
              id="event-date"
              name="event_date"
              value={formData.event_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="template-path">Certificate Template</label>
            <select id="template-path" name="template" value={formData.template} onChange={handleChange} required>
              <option value="template1">Participation Certificate</option>
              <option value="template2">Organizer Certificate</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="gen-type">Generation Type</label>
            <select id="gen-type" name="gen_type" value={formData.gen_type} onChange={handleChange} required>
              <option value="bulk">Bulk Generation</option>
              <option value="single">Single Certificate</option>
            </select>
          </div>
          <div id="data-ingestion">{renderDataIngestion()}</div>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                Generating... <span className="loading"></span>
              </>
            ) : (
              "Generate Certificates"
            )}
          </button>
        </form>
      </section>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title="Success"
        message={formData.gen_type === "bulk" ? "All certificates generated successfully" : "Certificate generated successfully!"}
        actionUrl={downloadUrl}
        actionText={formData.gen_type === "bulk" ? "Download Logs" : "View"}
      />
    </>
  )
}

export default CertificateForm

