"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { API_URL } from "@/lib/api"
import Link from "next/link"
import {
  Loader2,
  User,
  Mail,
  MailOpen,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ArrowRight,
  Bell,
} from "lucide-react"

interface FilhoResumo {
  id: number
  name: string
  parentesco: string
  turmasAluno: {
    turma: {
      id: number
      nome: string
      serie: string
    }
  }[]
  frequencia: {
    total: number
    presentes: number
    ausentes: number
    percentual: number
  }
  ultimaFalta: string | null
}

interface MensagemResumo {
  id: number
  titulo: string
  conteudo: string
  tipo: string
  categoria?: string
  createdAt: string
  remetente?: {
    id: number
    name: string
  }
  lida: boolean
}

interface DashboardData {
  filhos: FilhoResumo[]
  mensagens: {
    naoLidas: number
    ultimas: MensagemResumo[]
  }
}

export default function DashboardPaisPage() {
  const { user, token } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_URL}/parent/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const dashboardData = await response.json()
          setData(dashboardData)
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchDashboard()
    }
  }, [token])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getFrequenciaColor = (percentual: number) => {
    if (percentual >= 90) return "text-green-600"
    if (percentual >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getFrequenciaBg = (percentual: number) => {
    if (percentual >= 90) return "bg-green-100 dark:bg-green-950/30"
    if (percentual >= 75) return "bg-yellow-100 dark:bg-yellow-950/30"
    return "bg-red-100 dark:bg-red-950/30"
  }

  return (
    <ProtectedRoute requiredRole="PAI">
      <SidebarLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Olá, {user?.name?.split(" ")[0]}!</h1>
            <p className="text-muted-foreground">
              Acompanhe o resumo escolar dos seus filhos
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !data ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Erro ao carregar dados</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Cards de Resumo */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Filhos</span>
                    </div>
                    <p className="text-3xl font-bold mt-2">{data.filhos.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">vinculados à sua conta</p>
                  </CardContent>
                </Card>

                <Card className={data.mensagens.naoLidas > 0 ? "border-blue-500" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">Mensagens</span>
                    </div>
                    <p className="text-3xl font-bold mt-2 text-blue-600">{data.mensagens.naoLidas}</p>
                    <p className="text-xs text-muted-foreground mt-1">não lidas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Frequência Média</span>
                    </div>
                    <p className="text-3xl font-bold mt-2 text-green-600">
                      {data.filhos.length > 0
                        ? (
                            data.filhos.reduce((acc, f) => acc + f.frequencia.percentual, 0) /
                            data.filhos.length
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">de todos os filhos</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Resumo dos Filhos */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Meus Filhos</CardTitle>
                      <CardDescription>Frequência e situação</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/meus-filhos">
                        Ver detalhes
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {data.filhos.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum filho vinculado
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {data.filhos.map((filho) => (
                          <div
                            key={filho.id}
                            className="flex items-center justify-between p-4 rounded-lg border"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{filho.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {filho.turmasAluno[0]?.turma?.nome || "Sem turma"} •{" "}
                                  {filho.turmasAluno[0]?.turma?.serie || ""}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getFrequenciaBg(
                                  filho.frequencia.percentual
                                )} ${getFrequenciaColor(filho.frequencia.percentual)}`}
                              >
                                {filho.frequencia.percentual >= 90 ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : filho.frequencia.percentual >= 75 ? (
                                  <AlertTriangle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                {filho.frequencia.percentual.toFixed(1)}%
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {filho.frequencia.presentes} presenças / {filho.frequencia.ausentes}{" "}
                                faltas
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Últimas Mensagens */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Últimos Avisos</CardTitle>
                      <CardDescription>Comunicados recentes</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/meus-avisos">
                        Ver todos
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {data.mensagens.ultimas.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma mensagem recebida
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data.mensagens.ultimas.map((msg) => (
                          <Link
                            key={msg.id}
                            href="/meus-avisos"
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                              !msg.lida
                                ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                                : ""
                            }`}
                          >
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                !msg.lida
                                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {msg.lida ? (
                                <MailOpen className="h-4 w-4" />
                              ) : (
                                <Mail className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm truncate ${!msg.lida ? "font-semibold" : "font-medium"}`}
                              >
                                {msg.titulo}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{msg.conteudo}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(msg.createdAt)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Alertas de Faltas Recentes */}
              {data.filhos.some((f) => f.ultimaFalta) && (
                <Card className="border-yellow-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="h-5 w-5" />
                      Faltas Recentes
                    </CardTitle>
                    <CardDescription>
                      Filhos que tiveram faltas registradas recentemente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.filhos
                        .filter((f) => f.ultimaFalta)
                        .map((filho) => (
                          <div
                            key={filho.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-yellow-600" />
                              <div>
                                <p className="font-medium">{filho.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Última falta: {formatDate(filho.ultimaFalta!)}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/meus-filhos">Ver frequência</Link>
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  )
}
