"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { API_URL } from "@/lib/api"
import { Loader2, User, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Filho {
  id: number
  name: string
  login: string
  email?: string
  parentesco: string
  principal: boolean
}

interface Presenca {
  id: number
  data: string
  presente: boolean
  justificativa?: string
  turma: {
    nome: string
    serie: string
  }
}

interface FrequenciaStats {
  totalAulas: number
  presencas: number
  faltas: number
  percentualPresenca: number
}

export default function MeusFilhosPage() {
  const { token } = useAuth()
  const [filhos, setFilhos] = useState<Filho[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilho, setSelectedFilho] = useState<number | null>(null)
  const [frequencia, setFrequencia] = useState<Presenca[]>([])
  const [stats, setStats] = useState<FrequenciaStats | null>(null)
  const [loadingFrequencia, setLoadingFrequencia] = useState(false)

  // Buscar filhos vinculados
  useEffect(() => {
    const fetchFilhos = async () => {
      try {
        const response = await fetch(`${API_URL}/parent/children`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setFilhos(data)
          // Selecionar o primeiro filho automaticamente
          if (data.length > 0) {
            setSelectedFilho(data[0].id)
          }
        }
      } catch (error) {
        console.error("Erro ao buscar filhos:", error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchFilhos()
    }
  }, [token])

  // Buscar frequência do filho selecionado
  useEffect(() => {
    const fetchFrequencia = async () => {
      if (!selectedFilho) return

      setLoadingFrequencia(true)
      try {
        const response = await fetch(`${API_URL}/parent/children/${selectedFilho}/attendance`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setFrequencia(data.frequencia || [])
          setStats(data.estatisticas || null)
        }
      } catch (error) {
        console.error("Erro ao buscar frequência:", error)
      } finally {
        setLoadingFrequencia(false)
      }
    }

    if (token && selectedFilho) {
      fetchFrequencia()
    }
  }, [token, selectedFilho])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getFilhoSelecionado = () => {
    return filhos.find((f) => f.id === selectedFilho)
  }

  return (
    <ProtectedRoute requiredRole="PAI">
      <SidebarLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Meus Filhos</h1>
            <p className="text-muted-foreground">
              Acompanhe a frequência e informações dos seus filhos
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filhos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum filho vinculado à sua conta</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Lista de Filhos */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Filhos</CardTitle>
                    <CardDescription>Selecione para ver a frequência</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {filhos.map((filho) => (
                      <button
                        key={filho.id}
                        onClick={() => setSelectedFilho(filho.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                          selectedFilho === filho.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            selectedFilho === filho.id
                              ? "bg-primary-foreground/20"
                              : "bg-primary/10"
                          }`}
                        >
                          <User
                            className={`h-5 w-5 ${
                              selectedFilho === filho.id ? "text-primary-foreground" : "text-primary"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{filho.name}</p>
                          <p
                            className={`text-xs ${
                              selectedFilho === filho.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {filho.parentesco}
                            {filho.principal && " • Principal"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Frequência */}
              <div className="lg:col-span-2 space-y-6">
                {/* Estatísticas */}
                {stats && (
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Total de Aulas</span>
                        </div>
                        <p className="text-2xl font-bold mt-1">{stats.totalAulas}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">Presenças</span>
                        </div>
                        <p className="text-2xl font-bold mt-1 text-green-600">{stats.presencas}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-muted-foreground">Faltas</span>
                        </div>
                        <p className="text-2xl font-bold mt-1 text-red-600">{stats.faltas}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">Frequência</span>
                        </div>
                        <p className="text-2xl font-bold mt-1 text-blue-600">
                          {stats.percentualPresenca.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Histórico */}
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Frequência</CardTitle>
                    <CardDescription>
                      {getFilhoSelecionado()?.name || "Selecione um filho"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingFrequencia ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : frequencia.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum registro de frequência encontrado
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {frequencia.map((registro) => (
                          <div
                            key={registro.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              registro.presente
                                ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                                : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {registro.presente ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <div>
                                <p className="font-medium">{formatDate(registro.data)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {registro.turma.nome} - {registro.turma.serie}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  registro.presente
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}
                              >
                                {registro.presente ? "Presente" : "Ausente"}
                              </span>
                              {registro.justificativa && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {registro.justificativa}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  )
}
