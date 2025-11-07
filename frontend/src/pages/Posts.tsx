import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import { isAuthenticated, logout } from "@/utils/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Post {
  id: number;
  title: string;
  content: string;
  platforms: string[];
  status: string;
  scheduled_at: string | null;
  is_ai_generated: boolean;
  created_at: string;
}

const Posts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletePostId, setDeletePostId] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      if (!isAuthenticated()) {
        navigate("/auth");
        return;
      }

      const response = await apiService.getAllPosts();
      
      if (response.status) {
        setPosts(response.data.posts || []);
      }
    } catch (error: any) {
      if (error.message === 'Authentication failed') {
        logout();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to fetch posts",
          confirmButtonColor: "#6366f1"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;

    try {
      const response = await apiService.deletePost(deletePostId);

      if (response.status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Post deleted successfully",
          confirmButtonColor: "#6366f1"
        });
        fetchPosts();
      }
    } catch (error: any) {
      if (error.message === 'Authentication failed') {
        logout();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete post",
          confirmButtonColor: "#6366f1"
        });
      }
    } finally {
      setDeletePostId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500";
      case "scheduled":
        return "bg-blue-500";
      case "draft":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  console.log("post",posts)

  // Helper to always return array for platforms
  const getPlatformsArray = (platforms: string[] | string | undefined): string[] => {
    if (Array.isArray(platforms)) return platforms;
    if (typeof platforms === 'string' && platforms) {
      // Try to parse JSON array string
      try {
        const parsed = JSON.parse(platforms);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fallback: comma separated string
        return platforms.split(',').map(p => p.trim()).filter(Boolean);
      }
    }
    return [];
  };

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
            <p className="text-muted-foreground">Manage your social media posts</p>
          </div>
          <Button onClick={() => navigate("/posts/new")}> 
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No posts yet</p>
              <Button onClick={() => navigate("/posts/new")}> 
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {post.content}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className={getStatusColor(post.status)}>
                      {post.status}
                    </Badge>
                    {post.is_ai_generated && (
                      <Badge variant="outline">AI Generated</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {getPlatformsArray(post.platforms).map((platform) => (
                        <Badge key={platform} variant="secondary">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                    {post.scheduled_at && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {new Date(post.scheduled_at).toLocaleString()}
                      </div>
                    )}
                    <div className="flex gap-2">
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/posts/${post.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/posts/edit/${post.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeletePostId(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Posts;