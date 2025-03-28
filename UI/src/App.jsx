import Header from "./components/Header"
import CertificateForm from "./components/CertificateForm"
import Footer from "./components/Footer"

function App() {
  return (
    <div className="page-container">
      <Header />
      <main>
        <CertificateForm />
      </main>
      <Footer />
    </div>
  )
}

export default App

