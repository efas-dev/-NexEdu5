"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { API_URL } from "@/lib/api"
import { Check, X, Save, Loader2 } from "lucide-react"

interface Turma {
  id: number
  nome: string
  serie: string
  turno: string
}

interface Aluno {
  id: number
  name: string
  login: string
}

interface AttendanceRecord {
  alunoId: number
  presente: boolean
  justificativa?: string
}

export default function ChamadaPage() {
  const { user } = useAuth()
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [selectedTurma, setSelectedTurma] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [attendance, setAttendance] = useState<Record<number, AttendanceRecord>>({})
  const [loading, setLoading] = useState(false)
  const [loadingTurmas, setLoadingTurmas] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Buscar turmas do professor
  useEffect(() => {
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
      } finally {
        setLoadingTurmas(false)
      }
    }

    fetchTurmas()
  }, [])

  // Buscar alunos da turma e presenças existentes
  useEffect(() => {
    if (!selectedTurma || !selectedDate) return

    const fetchAlunosAndAttendance = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")

        // Buscar alunos da turma
        const alunosResponse = await fetch(`${API_URL}/turmas/${selectedTurma}/alunos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (alunosResponse.ok) {
          const alunosData = await alunosResponse.json()
          setAlunos(alunosData)

          // Inicializar attendance com todos presentes por padrão
          const initialAttendance: Record<number, AttendanceRecord> = {}
          alunosData.forEach((aluno: Aluno) => {
            initialAttendance[aluno.id] = { alunoId: aluno.id, presente: true }
          })
          setAttendance(initialAttendance)
        }

        // Buscar presenças existentes para a data
        const attendanceResponse = await fetch(
          `${API_URL}/attendance/turma/${selectedTurma}/date/${selectedDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json()
          if (attendanceData.presencas && attendanceData.presencas.length > 0) {
            const existingAttendance: Record<number, AttendanceRecord> = {}
            attendanceData.presencas.forEach((p: { alunoId: number; presente: boolean; justificativa?: string }) => {
              existingAttendance[p.alunoId] = {
                alunoId: p.alunoId,
                presente: p.presente,
                justificativa: p.justificativa,
              }
            })
            setAttendance((prev) => ({ ...prev, ...existingAttendance }))
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlunosAndAttendance()
  }, [selectedTurma, selectedDate])

  const togglePresenca = (alunoId: number) => {
    setAttendance((prev) => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        presente: !prev[alunoId]?.presente,
      },
    }))
  }

  const marcarTodosPresentes = () => {
    const newAttendance: Record<number, AttendanceRecord> = {}
    alunos.forEach((aluno) => {
      newAttendance[aluno.id] = { alunoId: aluno.id, presente: true }
    })
    setAttendance(newAttendance)
  }

  const marcarTodosAusentes = () => {
    const newAttendance: Record<number, AttendanceRecord> = {}
    alunos.forEach((aluno) => {
      newAttendance[aluno.id] = { alunoId: aluno.id, presente: false }
    })
    setAttendance(newAttendance)
  }

  const salvarChamada = async () => {
    if (!selectedTurma || !selectedDate) return

    setSaving(true)
    setMessage(null)

    try {
      const token = localStorage.getItem("token")
      const presencas = Object.values(attendance).map((a) => ({
        alunoId: a.alunoId,
        presente: a.presente,
        justificativa: a.justificativa || null,
      }))

      const response = await fetch(`${API_URL}/attendance/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          turmaId: parseInt(selectedTurma),
          data: selectedDate,
          presencas,
        }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Chamada salva com sucesso!" })
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Erro ao salvar chamada" })
      }
    } catch (error) {
      console.error("Erro ao salvar chamada:", error)
      setMessage({ type: "error", text: "Erro ao salvar chamada" })
    } finally {
      setSaving(false)
    }
  }

  const presentesCount = Object.values(attendance).filter((a) => a.presente).length
  const ausentesCount = Object.values(attendance).filter((a) => !a.presente).length

  return (
    <ProtectedRoute requiredRole="PROFESSOR">
      <SidebarLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Chamada</h1>
            <p className="text-muted-foreground">
              Registre a presença dos alunos
            </p>
          </div>

          {/* Seleção de Turma e Data */}
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Turma e Data</CardTitle>
              <CardDescription>
                Escolha a turma e a data para fazer a chamada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="turma">Turma</Label>
                  {loadingTurmas ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando turmas...
                    </div>
                  ) : (
                    <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                      <SelectTrigger id="turma">
                        <SelectValue placeholder="Selecione uma turma" />
                      </SelectTrigger>
                      <SelectContent>
                        {turmas.map((turma) => (
                          <SelectItem key={turma.id} value={turma.id.toString()}>
                            {turma.nome} - {turma.serie} ({turma.turno})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Alunos */}
          {selectedTurma && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lista de Alunos</CardTitle>
                    <CardDescription>
                      Clique no aluno para alternar entre presente e ausente
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={marcarTodosPresentes}>
                      <Check className="mr-1 h-4 w-4" />
                      Todos Presentes
                    </Button>
                    <Button variant="outline" size="sm" onClick={marcarTodosAusentes}>
                      <X className="mr-1 h-4 w-4" />
                      Todos Ausentes
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : alunos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum aluno encontrado nesta turma
                  </div>
                ) : (
                  <>
                    {/* Resumo */}
                    <div className="flex gap-4 mb-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm">Presentes: {presentesCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-sm">Ausentes: {ausentesCount}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total: {alunos.length}
                      </div>
                    </div>

                    {/* Lista */}
                    <div className="space-y-2">
                      {alunos.map((aluno) => {
                        const isPresente = attendance[aluno.id]?.presente ?? true
                        return (
                          <div
                            key={aluno.id}
                            onClick={() => togglePresenca(aluno.id)}
                            className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                              isPresente
                                ? "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:border-green-800"
                                : "bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:border-red-800"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  isPresente ? "bg-green-500" : "bg-red-500"
                                }`}
                              >
                                {isPresente ? (
                                  <Check className="h-5 w-5 text-white" />
                                ) : (
                                  <X className="h-5 w-5 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{aluno.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {aluno.login}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-sm font-medium ${
                                isPresente ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isPresente ? "Presente" : "Ausente"}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Botão Salvar */}
                    <div className="mt-6 flex items-center justify-between">
                      {message && (
                        <div
                          className={`text-sm ${
                            message.type === "success" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {message.text}
                        </div>
                      )}
                      <Button
                        onClick={salvarChamada}
                        disabled={saving || alunos.length === 0}
                        className="ml-auto"
                      >
                        {saving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Salvar Chamada
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  )
}
