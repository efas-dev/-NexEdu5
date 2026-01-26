"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { SidebarLayout } from "@/components/sidebar-layout"
import { PostsTable } from "@/components/posts-table"

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="PROFESSOR">
      <SidebarLayout>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Administração</h1>
          <p className="text-muted-foreground">
            Gerenciamento de postagens do sistema
          </p>
          <PostsTable />
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  )
}
