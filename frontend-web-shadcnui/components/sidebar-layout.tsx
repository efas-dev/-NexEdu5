"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/contexts/AuthContext"

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user, logout } = useAuth()

  const formatRole = (role?: string) => {
    if (!role) return ""
    return role.charAt(0) + role.slice(1).toLowerCase()
  }

  return (
    <SidebarProvider>
      <AppSidebar
        userName={user?.name}
        userRole={formatRole(user?.role)}
        onLogout={logout}
      />
      <main className="flex-1 w-full">
        <div className="border-b p-4">
          <SidebarTrigger />
        </div>
        <div className="p-4">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
