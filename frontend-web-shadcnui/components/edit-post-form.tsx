"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Post } from "@/components/post-item"
import { API_URL } from "@/lib/api"

interface EditPostFormProps {
  post: Post
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditPostForm({ post, onSuccess, onCancel }: EditPostFormProps) {
  const [title, setTitle] = useState(post.Title)
  const [content, setContent] = useState(post.Content)
  const [author, setAuthor] = useState(post.Author)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setTitle(post.Title)
    setContent(post.Content)
    setAuthor(post.Author)
  }, [post])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Title: title,
          Content: content,
          Author: author,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar post")
      }

      onSuccess?.()
    } catch (err) {
      setError("Erro ao atualizar post. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite o título do post"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Autor</Label>
        <Input
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Digite o nome do autor"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Conteúdo</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Digite o conteúdo do post"
          className="min-h-[200px]"
          required
        />
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  )
}
