import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/api/client"

export function useAuthGuard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/Auth/me")
        setIsAuthenticated(true)
      } catch {
        setIsAuthenticated(false)
        navigate("/login")
      }
    }

    checkAuth()
  }, [navigate])

  return isAuthenticated
}
