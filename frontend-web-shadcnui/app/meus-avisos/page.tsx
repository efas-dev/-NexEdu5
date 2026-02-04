"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { API_URL } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Mail, MailOpen, Calendar, Bell, Megaphone, Eye } from "lucide-react"

// Estrutura flat retornada pelo backend
interface Mensagem {
  id: number
  recipientId: number
  titulo: string
  conteudo: string
  tipo: "INDIVIDUAL" | "TURMA" | "GERAL"
  categoria?: string
  createdAt: string
  lida: boolean
  lidaEm?: string
  remetente?: {
    id: number
    name: string
    role: string
  }
  turma?: {
    id: number
    nome: string
  }
  aluno?: {
    id: number
    name: string
  }
}

const CATEGORIAS: Record<string, { label: string; icon: React.ElementType }> = {
  FERIADO: { label: "Feriado", icon: Calendar },
  EVENTO: { label: "Evento", icon: Megaphone },
  AVISO: { label: "Aviso", icon: Bell },
}

export default function MeusAvisosPage() {
  const { token } = useAuth()
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMensagem, setSelectedMensagem] = useState<Mensagem | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // Buscar mensagens recebidas
  useEffect(() => {
    const fetchMensagens = async () => {
      try {
        const response = await fetch(`${API_URL}/messages/inbox`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setMensagens(data.mensagens || [])
        }
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchMensagens()
    }
  }, [token])

  const marcarComoLida = async (mensagem: Mensagem) => {
    if (mensagem.lida) return

    try {
      await fetch(`${API_URL}/messages/${mensagem.id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Atualizar estado local
      setMensagens((prev) =>
        prev.map((m) =>
          m.id === mensagem.id ? { ...m, lida: true, lidaEm: new Date().toISOString() } : m
        )
      )
    } catch (error) {
      console.error("Erro ao marcar como lida:", error)
    }
  }

  const handleView = async (mensagem: Mensagem) => {
    setSelectedMensagem(mensagem)
    setViewDialogOpen(true)
    await marcarComoLida(mensagem)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCategoriaInfo = (categoria?: string) => {
    return CATEGORIAS[categoria || "AVISO"] || CATEGORIAS.AVISO
  }

  const naoLidas = mensagens.filter((m) => !m.lida).length

  return (
    <ProtectedRoute requiredRole="PAI">
      <SidebarLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Meus Avisos</h1>
            <p className="text-muted-foreground">
              Comunicados e avisos da escola
              {naoLidas > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  {naoLidas} não {naoLidas === 1 ? "lido" : "lidos"}
                </span>
              )}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Caixa de Entrada</CardTitle>
              <CardDescription>Mensagens recebidas da escola e professores</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : mensagens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mb-4" />
                  <p>Nenhuma mensagem recebida</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mensagens.map((mensagem) => {
                    const categoriaInfo = getCategoriaInfo(mensagem.categoria)
                    const Icon = categoriaInfo.icon

                    return (
                      <div
                        key={mensagem.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                          !mensagem.lida ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900" : ""
                        }`}
                        onClick={() => handleView(mensagem)}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              !mensagem.lida
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {mensagem.lida ? (
                              <MailOpen className="h-5 w-5" />
                            ) : (
                              <Mail className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-medium ${!mensagem.lida ? "font-semibold" : ""}`}>
                                {mensagem.titulo}
                              </h3>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted inline-flex items-center gap-1">
                                <Icon className="h-3 w-3" />
                                {categoriaInfo.label}
                              </span>
                              {mensagem.tipo === "INDIVIDUAL" && mensagem.aluno && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                  Sobre: {mensagem.aluno.name}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {mensagem.conteudo}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">
                                De: {mensagem.remetente?.name || "Escola"}
                              </p>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(mensagem.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog Visualizar */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedMensagem && (
                  <>
                    {(() => {
                      const Icon = getCategoriaInfo(selectedMensagem.categoria).icon
                      return <Icon className="h-5 w-5" />
                    })()}
                    {selectedMensagem.titulo}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedMensagem && (
                  <>
                    De: {selectedMensagem.remetente?.name || "Escola"} •{" "}
                    {formatDate(selectedMensagem.createdAt)}
                    {selectedMensagem.tipo === "INDIVIDUAL" &&
                      selectedMensagem.aluno && (
                        <> • Sobre: {selectedMensagem.aluno.name}</>
                      )}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap">{selectedMensagem?.conteudo}</p>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarLayout>
    </ProtectedRoute>
  )
}
