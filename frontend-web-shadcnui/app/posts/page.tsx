"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarLayout } from "@/components/sidebar-layout"
import { PostItem, Post } from "@/components/post-item"
import { PostSearch } from "@/components/post-search"
import { CreatePostForm } from "@/components/create-post-form"
import { EditPostForm } from "@/components/edit-post-form"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
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
import { Plus } from "lucide-react"

export default function PostsPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [deletingPost, setDeletingPost] = useState<Post | null>(null)

  const fetchPosts = async (query?: string) => {
    try {
      const token = localStorage.getItem("token")
      const url = query
        ? `${API_URL}/posts/search?q=${encodeURIComponent(query)}`
        : `${API_URL}/posts`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error("Erro ao buscar posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleSearch = (query: string) => {
    if (query.trim()) {
      fetchPosts(query)
    } else {
      fetchPosts()
    }
  }

  const handleView = (post: Post) => {
    setSelectedPost(post)
    setViewDialogOpen(true)
  }

  const handleEdit = (post: Post) => {
    setSelectedPost(post)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (post: Post) => {
    setDeletingPost(post)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingPost) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/posts/${deletingPost.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setDeleteAlertOpen(false)
        setDeletingPost(null)
        fetchPosts()
      }
    } catch (error) {
      console.error("Erro ao excluir post:", error)
    }
  }

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    fetchPosts()
  }

  const isProfessor = user?.role === "PROFESSOR"

  return (
    <ProtectedRoute>
      <SidebarLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Posts</h1>
            {isProfessor && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Post
              </Button>
            )}
          </div>

          <PostSearch onSearch={handleSearch} />

          {loading ? (
            <div>Carregando posts...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  isProfessor={isProfessor}
                />
              ))}
            </div>
          )}
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Post</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo post educacional
              </DialogDescription>
            </DialogHeader>
            <CreatePostForm
              authorName={user?.name || ""}
              onSuccess={handleCreateSuccess}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedPost?.Title}</DialogTitle>
              <DialogDescription>
                Por {selectedPost?.Author} em{" "}
                {selectedPost?.createdAt
                  ? new Date(selectedPost.createdAt).toLocaleDateString("pt-BR")
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{selectedPost?.Content}</p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Post</DialogTitle>
              <DialogDescription>
                Atualize os dados do post
              </DialogDescription>
            </DialogHeader>
            {selectedPost && (
              <EditPostForm
                post={selectedPost}
                onSuccess={() => {
                  setEditDialogOpen(false)
                  fetchPosts()
                }}
                onCancel={() => setEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o post &quot;{deletingPost?.Title}&quot;?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarLayout>
    </ProtectedRoute>
  )
}
