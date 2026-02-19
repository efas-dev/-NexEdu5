"use client"

import Image from "next/image"
import { BookOpen, Settings, LogOut, ClipboardCheck, Megaphone, Users, Mail, LayoutDashboard } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

// Dados do menu
const menuItems = [
  {
    title: "Posts",
    url: "/posts",
    icon: BookOpen,
    roles: ["PROFESSOR", "ALUNO", "PAI", "ADMIN"],
  },
  {
    title: "Dashboard",
    url: "/dashboard-pais",
    icon: LayoutDashboard,
    roles: ["PAI"],
  },
  {
    title: "Meus Filhos",
    url: "/meus-filhos",
    icon: Users,
    roles: ["PAI"],
  },
  {
    title: "Meus Avisos",
    url: "/meus-avisos",
    icon: Mail,
    roles: ["PAI"],
  },
  {
    title: "Chamada",
    url: "/chamada",
    icon: ClipboardCheck,
    roles: ["PROFESSOR"],
  },
  {
    title: "Avisos",
    url: "/avisos",
    icon: Megaphone,
    roles: ["ADMIN"],
  },
  {
    title: "Administração",
    url: "/admin",
    icon: Settings,
    roles: ["PROFESSOR", "ADMIN"],
  },
]

interface AppSidebarProps {
  userName?: string
  userRole?: string
  onLogout?: () => void
}

export function AppSidebar({ userName = "Usuário", userRole = "Aluno", onLogout }: AppSidebarProps) {
  const normalizedRole = userRole?.toUpperCase() || "ALUNO"

  const filteredMenuItems = menuItems.filter((item) => {
    return item.roles.includes(normalizedRole)
  })

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center px-4 py-4">
          <Image
            src="/Logo.png"
            alt="NexEdu"
            width={120}
            height={48}
            priority
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-1 px-4 py-2 text-sm">
              <span className="font-medium">{userName}</span>
              <span className="text-xs text-muted-foreground">{userRole}</span>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout}>
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
