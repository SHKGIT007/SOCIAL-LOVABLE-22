import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  platforms: string[] | string;
  status: string;
  scheduled_at: string | null;
  is_ai_generated: boolean;
  created_at: string;
  review_status: "pending" | "approved" | "rejected";
}

// Helper to filter posts by status
function filteredPosts(posts: Post[], status: string) {
  if (status === "all") return posts;
  return posts.filter((post) => post.status === status);
}

const Posts = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [generationFilter, setGenerationFilter] = useState<string>("all");

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
      if (error.message === "Authentication failed") {
        logout();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to fetch posts",
          confirmButtonColor: "#6366f1",
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
          confirmButtonColor: "#6366f1",
        });
        fetchPosts();
      }
    } catch (error: any) {
      if (error.message === "Authentication failed") {
        logout();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete post",
          confirmButtonColor: "#6366f1",
        });
      }
    } finally {
      setDeletePostId(null);
    }
  };

  const handleApprove = async (postId: number) => {
    const result = await Swal.fire({
      title: "Approve Post?",
      text: "Are you sure you want to approve this post?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10b981",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiService.approvePost(postId, "approved");

      if (response.status) {
        Swal.fire({
          icon: "success",
          title: "Post Approved ✅",
          text: "This post is now approved and ready for publishing.",
          confirmButtonColor: "#6366f1",
        });
        fetchPosts();
      } else {
        throw new Error(response.message || "Failed to approve post");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to approve post",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  const handleReject = async (postId: number) => {
    const result = await Swal.fire({
      title: "Reject Post?",
      text: "Are you sure you want to reject this post?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiService.approvePost(postId, "rejected");

      if (response.status) {
        Swal.fire({
          icon: "success",
          title: "Post Rejected ❌",
          text: "This post has been marked as rejected.",
          confirmButtonColor: "#6366f1",
        });
        fetchPosts();
      } else {
        throw new Error(response.message || "Failed to reject post");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to reject post",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  function filteredPosts(posts: Post[], status: string, generation: string) {
    let filtered = posts;

    if (status !== "all") {
      filtered = filtered.filter((post) => post.status === status);
    }

    if (generation === "ai") {
      filtered = filtered.filter((post) => post.is_ai_generated === true);
    }

    if (generation === "manual") {
      filtered = filtered.filter((post) => post.is_ai_generated === false);
    }

    return filtered;
  }

  // Softer pastel chips like your dashboard
  const statusClasses = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "scheduled":
        return "bg-sky-100 text-sky-700 border border-sky-200";
      case "draft":
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  // Helper to always return array for platforms
  const getPlatformsArray = (
    platforms: string[] | string | undefined
  ): string[] => {
    if (Array.isArray(platforms)) return platforms;
    if (typeof platforms === "string" && platforms) {
      // Try to parse JSON array string
      try {
        const parsed = JSON.parse(platforms);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fallback: comma separated string
        return platforms
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  console.log("post", posts);

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header — gradient kicker + subtitle for theme consistency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="flex items-baseline gap-2 text-3xl font-extrabold">
              <span className="bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">
                Posts
              </span>
            </h1>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ml-4 px-3 py-2 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 focus:outline-none focus:ring focus:ring-indigo-100 text-sm font-semibold"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
            <select
              value={generationFilter}
              onChange={(e) => setGenerationFilter(e.target.value)}
              className="ml-4 px-3 py-2 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 focus:outline-none focus:ring focus:ring-indigo-100 text-sm font-semibold"
            >
              <option value="all">All Types</option>
              <option value="ai">AI Generated</option>
              <option value="manual">Manually Generated</option>
            </select>
          </div>
          <Button
            onClick={() => navigate("/posts/new")}
            className="h-10 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>

        {filteredPosts(posts, statusFilter, generationFilter).length === 0 ? (
          <Card className="border-indigo-100">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No posts yet</p>
              <Button
                onClick={() => navigate("/posts/new")}
                className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-md"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPosts(posts, statusFilter, generationFilter).map(
              (post) => {
                const isPastSchedule = post.scheduled_at
                  ? new Date(post.scheduled_at) <= new Date()
                  : false;
                const showViewOnly =
                  post.status === "published" ||
                  post.review_status === "rejected" ||
                  (post.review_status === "pending" && !!isPastSchedule);
                const canApproveReject =
                  post.status === "scheduled" &&
                  post.review_status === "pending" &&
                  !isPastSchedule;

                return (
                  <Card
                    key={post.id}
                    className="border border-indigo-100/60 hover:border-indigo-200 hover:shadow-lg transition-all"
                  >
                    <CardHeader className="pb-3">
                      <div className="space-y-2">
                        <CardTitle className="text-lg line-clamp-1">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {post.content}
                        </CardDescription>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className={statusClasses(post.status)}>
                          {post.status}
                        </Badge>

                        {post.is_ai_generated ? (
                          <Badge variant="outline">AI Generated</Badge>
                        ) : (
                          <Badge variant="outline">Manually Generated</Badge>
                        )}

                        {/* {post.review_status === "approved" && (
                          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Approved
                          </Badge>
                        )}

                        {post.review_status === "pending" && (
                          <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200">
                            Pending Review
                          </Badge>
                        )}

                        {post.review_status === "rejected" && (
                          <Badge className="bg-red-100 text-red-700 border border-red-200">
                            Rejected
                          </Badge>
                        )} */}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      {/* Platforms */}
                      <div className="flex flex-wrap gap-1">
                        {getPlatformsArray(post.platforms).map((platform) => (
                          <Badge
                            key={platform}
                            variant="secondary"
                            className="capitalize"
                          >
                            {platform}
                          </Badge>
                        ))}
                      </div>

                      {/* Schedule */}
                      {post.scheduled_at && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(post.scheduled_at).toLocaleString()}
                        </div>
                      )}
                    </CardContent>

                    {/* ------- BUTTONS HERE ------- */}
                    <CardFooter className="mt-2 pt-4 flex items-center gap-2 flex-wrap border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-3 flex items-center gap-1"
                        onClick={() => navigate(`/posts/${post.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>

                      {!showViewOnly && (
                        <>
                          {canApproveReject && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 px-3 flex items-center gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                onClick={() => handleApprove(post.id)}
                              >
                                ✓ Approve
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 px-3 flex items-center gap-1 text-red-700 border-red-300 hover:bg-red-50"
                                onClick={() => handleReject(post.id)}
                              >
                                ✗ Reject
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 flex items-center gap-1"
                            onClick={() => navigate(`/posts/edit/${post.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-9 px-3 flex items-center gap-1"
                            onClick={() => setDeletePostId(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Confirm delete */}
      <AlertDialog
        open={!!deletePostId}
        onOpenChange={() => setDeletePostId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              post.
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
