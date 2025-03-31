"use client"

import { createContext, useState, useContext, useEffect } from "react"

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken")
    if (storedToken) {
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  // Login function - handles API call and token storage
  const login = async (username, password) => {
    try {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("password", password)

      const response = await fetch("https://devsoc-autocred-rjto.onrender.com/token", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Login failed")
      }

      const data = await response.json()
      localStorage.setItem("authToken", data.access_token)
      setToken(data.access_token)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  // Logout function - revokes token and clears storage
  const logout = async () => {
    try {
      if (token) {
        await fetch("http://127.0.0.1:8000/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      localStorage.removeItem("authToken")
      setToken(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

