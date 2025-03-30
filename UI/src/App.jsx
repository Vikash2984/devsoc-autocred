"use client"
import Header from "./components/Header"
import CertificateForm from "./components/CertificateForm"
import LoginPage from "./components/LoginPage"
import Footer from "./components/Footer"
import { AuthProvider, useAuth } from "./context/AuthContext"

// Main content component that handles conditional rendering based on auth state
function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <main className="loading-container">
          <div className="loading-spinner"></div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="page-container">
      <Header />
      <main>{isAuthenticated ? <CertificateForm /> : <LoginPage />}</main>
      <Footer />
    </div>
  )
}

// Root component wrapped with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

