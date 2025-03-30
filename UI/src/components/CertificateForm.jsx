"use client"

import { useState, useEffect, useRef } from "react"
import Modal from "./Modal"
import ProgressModal from "./ProgressModal"
import { useAuth } from "../context/AuthContext"

function CertificateForm() {
  const { token, logout } = useAuth()

  // Form state
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
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState("")
  const [progress, setProgress] = useState({ completed: 0, total: 0 })

  // References for tracking progress
  const eventSourceRef = useRef(null)
  const bulkResultRef = useRef(null)
  const isProcessingRef = useRef(false)

  // Cleanup event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      isProcessingRef.current = false
    }
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, file: e.target.files[0] }))
      setFileName(`File selected: ${e.target.files[0].name}`)
    } else {
      setFormData((prev) => ({ ...prev, file: null }))
      setFileName("")
    }
  }

  // Format date for API
  const formatDate = (inputDate) => {
    if (!inputDate) return ""
    const [year, month, day] = inputDate.split("-")
    return `${day}-${month}-${year}`
  }

  // Start tracking progress for bulk generation
  const startProgressTracking = async (eventName) => {
    isProcessingRef.current = true
    setProgress({ completed: 0, total: 0 })
    setShowProgressModal(true)

    // Poll for total certificates
    const pollTotalInterval = setInterval(async () => {
      if (!isProcessingRef.current) {
        clearInterval(pollTotalInterval)
        return
      }

      try {
        const response = await fetch(`http://127.0.0.1:8000/progress/${eventName}/total`)
        const data = await response.json()

        if (data.total_certificates && data.total_certificates !== "Event not found") {
          const total = Number.parseInt(data.total_certificates)
          setProgress((prev) => ({ ...prev, total }))

          if (total > 0) {
            clearInterval(pollTotalInterval)
          }
        }
      } catch (error) {
        console.warn("Error polling for total certificates:", error)
      }
    }, 500)

    // Set up EventSource for completed updates
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const setupEventSource = () => {
      const eventSource = new EventSource(`http://127.0.0.1:8000/progress/${eventName}/completed`)
      eventSourceRef.current = eventSource

      eventSource.onmessage = (event) => {
        try {
          const completedCount = Number.parseInt(event.data)

          setProgress((prev) => {
            // If we've reached the total, close everything and show success
            if (prev.total > 0 && completedCount >= prev.total) {
              clearInterval(pollTotalInterval)
              eventSource.close()
              eventSourceRef.current = null
              isProcessingRef.current = false

              if (bulkResultRef.current?.log_file_url) {
                setTimeout(() => {
                  setDownloadUrl(bulkResultRef.current.log_file_url)
                  setShowProgressModal(false)
                  setShowModal(true)
                }, 500)
              }
            }

            return { ...prev, completed: completedCount }
          })
        } catch (error) {
          console.error("Error processing event data:", error)
        }
      }

      eventSource.onerror = () => {
        // Only try to reconnect if we're still processing
        if (isProcessingRef.current) {
          eventSource.close()
          setTimeout(setupEventSource, 1000)
        }
      }

      return eventSource
    }

    setupEventSource()
    return true
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const submitData = new FormData()

    // Add form fields to FormData
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
      if (formData.gen_type === "bulk") {
        // For bulk generation
        await startProgressTracking(formData.event_name)

        const response = await fetch("http://127.0.0.1:8000/generate-certificates", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: submitData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || "Failed to generate certificates")
        }

        const result = await response.json()
        bulkResultRef.current = result

        if (!isProcessingRef.current && result.log_file_url) {
          setDownloadUrl(result.log_file_url)
          setShowProgressModal(false)
          setShowModal(true)
        }
      } else {
        // For single certificate generation
        const response = await fetch("http://127.0.0.1:8000/generate-certificates", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: submitData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || "Failed to generate certificate")
        }

        const result = await response.json()

        if (result.download_url) {
          setDownloadUrl(result.download_url)
          setShowModal(true)
        }
      }
    } catch (error) {
      console.error("Error generating certificates:", error)

      // Handle authentication errors
      if (
        error.message.includes("Could not validate credentials") ||
        error.message.includes("Invalid token") ||
        error.message.includes("Token revoked")
      ) {
        alert("Your session has expired. Please log in again.")
        logout()
      } else {
        alert("Error generating certificates. Please try again.")
      }

      setShowProgressModal(false)
      isProcessingRef.current = false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render form fields based on generation type
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
    }

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

  return (
    <>
      <section className="form-section">
        <div className="form-header">
          <button onClick={logout} className="logout-btn">
            Logout  <i class="fa-solid fa-arrow-right-from-bracket logout-icon"></i>
          </button>
        </div>

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

      {/* Success Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Success"
        message={
          formData.gen_type === "single"
            ? "Certificate generated successfully!"
            : "All certificates generated successfully!"
        }
        actionUrl={downloadUrl}
        actionText={formData.gen_type === "single" ? "View" : "Download Log"}
      />

      {/* Progress Modal */}
      <ProgressModal isOpen={showProgressModal} completed={progress.completed} total={progress.total} />
    </>
  )
}

export default CertificateForm
