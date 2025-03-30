function ProgressModal({ isOpen, completed, total }) {
  if (!isOpen) return null

  // Show progress bar only when we have a total
  if (total > 0) {
    const progress = (completed / total) * 100

    return (
      <div className="modal-backdrop">
        <div className="modal-container">
          <div className="modal-header">
            <h3>Generating Certificates</h3>
          </div>
          <div className="modal-body">
            <div className="progress-container">
              <div className="progress-info">
                <p>
                  Generating certificate {completed} of {total}
                </p>
                <p>{Math.round(progress)}%</p>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show buffering spinner when preparing
  return (
    <div className="modal-backdrop">
      <div className="buffering-spinner"></div>
    </div>
  )
}

export default ProgressModal

