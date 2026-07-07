import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "@/api/auth"
import type { User } from "@/api/auth"

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.me()
        setUser(userData)
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const logout = () => {
    setUser(null)
    navigate("/login", { replace: true })
  }

  return { user, loading, logout }
}
