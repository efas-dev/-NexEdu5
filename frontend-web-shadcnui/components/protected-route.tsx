"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

type Role = "PROFESSOR" | "ALUNO" | "ADMIN" | "PAI"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Role | Role[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  const hasAccess = () => {
    if (!requiredRole) return true
    if (!user?.role) return false

    // Se for array, verifica se o role do usuário está incluído
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role as Role)
    }

    // Se for string única, compara diretamente
    return user.role === requiredRole
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!hasAccess()) {
      router.push("/")
    }
  }, [isAuthenticated, user, requiredRole, router])

  if (!isAuthenticated) {
    return null
  }

  if (!hasAccess()) {
    return null
  }

  return <>{children}</>
}
