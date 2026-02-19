"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_URL } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Send, Loader2, Megaphone, Calendar, Bell, Trash2, Eye } from "lucide-react"

interface Message {
  id: number
  titulo: string
  conteudo: string
  tipo: "INDIVIDUAL" | "TURMA" | "GERAL"
  categoria?: string
  createdAt: string
  remetente?: {
    name: string
  }
  turma?: {
    nome: string
  }
}

interface Turma {
  id: number
  nome: string
  serie: string
  turno: string
}

const CATEGORIAS = [
  { value: "FERIADO", label: "Feriado", icon: Calendar },
  { value: "EVENTO", label: "Evento", icon: Megaphone },
  { value: "AVISO", label: "Aviso Geral", icon: Bell },
]

export default function AvisosPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form state
  const [titulo, setTitulo] = useState("")
  const [conteudo, setConteudo] = useState("")
  const [tipo, setTipo] = useState<"TURMA" | "GERAL">("GERAL")
  const [categoria, setCategoria] = useState("AVISO")
  const [selectedTurma, setSelectedTurma] = useState("")

  const isAdmin = user?.role === "ADMIN"
  const isProfessor = user?.role === "PROFESSOR"

  // Buscar mensagens enviadas
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/messages/sent?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.mensagens || [])
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error)
    } finally {
      setLoading(false)
    }
  }

  // Buscar turmas
  const fetchTurmas = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/turmas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTurmas(data)
      }
    } catch (error) {
      console.error("Erro ao buscar turmas:", error)
    }
  }

  useEffect(() => {
    fetchMessages()
    fetchTurmas()
  }, [])

  const resetForm = () => {
    setTitulo("")
    setConteudo("")
    setTipo("GERAL")
    setCategoria("AVISO")
    setSelectedTurma("")
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setMessage(null)

    try {
      const token = localStorage.getItem("token")

      let endpoint = ""
      let body: Record<string, unknown> = {}

      if (tipo === "GERAL") {
        // Mensagem global (apenas ADMIN)
        endpoint = `${API_URL}/messages/global`
        body = {
          titulo,
          conteudo,
          categoria,
        }
      } else if (tipo === "TURMA" && selectedTurma) {
        // Mensagem para turma (broadcast)
        endpoint = `${API_URL}/messages/broadcast`
        body = {
          titulo,
          conteudo,
          turmaId: parseInt(selectedTurma),
          categoria,
        }
      } else {
        setMessage({ type: "error", text: "Selecione uma turma para enviar a mensagem" })
        setSending(false)
        return
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Aviso enviado com sucesso!" })
        resetForm()
        setCreateDialogOpen(false)
        fetchMessages()
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Erro ao enviar aviso" })
      }
    } catch (error) {
      console.error("Erro ao enviar aviso:", error)
      setMessage({ type: "error", text: "Erro ao enviar aviso" })
    } finally {
      setSending(false)
    }
  }

  const handleView = (msg: Message) => {
    setSelectedMessage(msg)
    setViewDialogOpen(true)
  }

  const handleDeleteClick = (msg: Message) => {
    setSelectedMessage(msg)
    setDeleteAlertOpen(true)
  }

  const getCategoriaIcon = (cat?: string) => {
    const categoria = CATEGORIAS.find((c) => c.value === cat)
    if (categoria) {
      const Icon = categoria.icon
      return <Icon className="h-4 w-4" />
    }
    return <Bell className="h-4 w-4" />
  }

  const getCategoriaLabel = (cat?: string) => {
    const categoria = CATEGORIAS.find((c) => c.value === cat)
    return categoria?.label || "Aviso"
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

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <SidebarLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Avisos</h1>
              <p className="text-muted-foreground">
                Envie avisos sobre feriados, eventos e comunicados gerais
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Aviso
            </Button>
          </div>

          {/* Lista de Avisos Enviados */}
          <Card>
            <CardHeader>
              <CardTitle>Avisos Enviados</CardTitle>
              <CardDescription>
                Histórico de avisos enviados aos pais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum aviso enviado ainda
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {getCategoriaIcon(msg.categoria)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{msg.titulo}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                              {getCategoriaLabel(msg.categoria)}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              {msg.tipo === "GERAL" ? "Global" : msg.turma?.nome || "Turma"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {msg.conteudo}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enviado em {formatDate(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(msg)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(msg)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog Criar Aviso */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Aviso</DialogTitle>
              <DialogDescription>
                Crie um aviso para enviar aos pais dos alunos
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="h-4 w-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Destinatários</Label>
                  <Select value={tipo} onValueChange={(v) => setTipo(v as "TURMA" | "GERAL")}>
                    <SelectTrigger id="tipo">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {isAdmin && (
                        <SelectItem value="GERAL">
                          <div className="flex items-center gap-2">
                            <Megaphone className="h-4 w-4" />
                            Todos os Pais (Global)
                          </div>
                        </SelectItem>
                      )}
                      <SelectItem value="TURMA">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Turma Específica
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {tipo === "TURMA" && (
                <div className="space-y-2">
                  <Label htmlFor="turma">Turma</Label>
                  <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                    <SelectTrigger id="turma">
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmas.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id.toString()}>
                          {turma.nome} - {turma.serie} ({turma.turno})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Feriado - Dia da Independência"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conteudo">Conteúdo</Label>
                <Textarea
                  id="conteudo"
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Digite o conteúdo do aviso..."
                  rows={5}
                  required
                />
              </div>

              {message && (
                <div
                  className={`text-sm p-3 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setCreateDialogOpen(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={sending}>
                  {sending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Enviar Aviso
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Visualizar */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getCategoriaIcon(selectedMessage?.categoria)}
                {selectedMessage?.titulo}
              </DialogTitle>
              <DialogDescription>
                Enviado em {selectedMessage?.createdAt ? formatDate(selectedMessage.createdAt) : ""}
                {" | "}
                {selectedMessage?.tipo === "GERAL" ? "Global" : selectedMessage?.turma?.nome || "Turma"}
              </DialogDescription>
            </DialogHeader>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{selectedMessage?.conteudo}</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert Delete */}
        <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o aviso &quot;{selectedMessage?.titulo}&quot;?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  // TODO: Implementar delete quando endpoint estiver disponível
                  setDeleteAlertOpen(false)
                }}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarLayout>
    </ProtectedRoute>
  )
}
