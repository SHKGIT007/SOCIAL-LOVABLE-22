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
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Eye,
  Filter,
  Clock,
  CheckCircle2,
  FileText,
  Flame,
  Sparkles,
  ArrowRight,
  ImageIcon,
} from "lucide-react";
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
import { useLocation } from "react-router-dom";

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
  image_url?: string | null;
}

function filteredPosts(posts: Post[], status: string) {
  if (status === "all") return posts;
  return posts.filter((post) => post.status === status);
}

const Posts = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  const location = useLocation();
  const filter = location.state?.filter;
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [generationFilter, setGenerationFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, generationFilter]);

  useEffect(() => {
    fetchPosts();
  }, [page, limit, statusFilter, generationFilter]);

  useEffect(() => {
    if (!filter) return;

    if (filter === "AI Generated") {
      setGenerationFilter("ai");
      setStatusFilter("all");
    }

    if (filter === "Scheduled") {
      setStatusFilter("scheduled");
      setGenerationFilter("all");
    }

    if (filter === "Published") {
      setStatusFilter("published");
      setGenerationFilter("all");
    }

    navigate("/posts", { replace: true });
  }, [filter]);

  const fetchPosts = async () => {
    try {
      if (!isAuthenticated()) {
        navigate("/auth");
        return;
      }

      const response = await apiService.getAllPosts({
        page,
        limit,
        status: statusFilter !== "all" ? statusFilter : undefined,
        generation: generationFilter !== "all" ? generationFilter : undefined,
      });
      if (response.status) {
        setPosts(response.data.posts || []);
        setTotalPages(response?.data?.pagination?.totalPages || 0);
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

  const statusClasses = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "scheduled":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "draft":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle2 className="h-3 w-3" />;
      case "scheduled":
        return <Clock className="h-3 w-3" />;
      case "draft":
        return <FileText className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getPlatformsArray = (
    platforms: string[] | string | undefined,
  ): string[] => {
    if (Array.isArray(platforms)) return platforms;
    if (typeof platforms === "string" && platforms) {
      try {
        const parsed = JSON.parse(platforms);
        if (Array.isArray(parsed)) return parsed;
      } catch {
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
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-indigo-600" />
            <p className="text-sm text-slate-600 font-medium">
              Loading posts...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout userRole="client">
      <div className="min-h-screen bg-slate-50">
        <div
          className="
    sticky top-0 z-10
    -mx-6 px-6 py-5 mb-6
    bg-gradient-to-b from-white/90 to-white/70
    backdrop-blur
    border-b border-indigo-100
    flex flex-col sm:flex-row sm:items-center sm:justify-between
    gap-4
  "
        >
          <div>
            <h1 className="text-3xl font-extrabold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                Posts
              </span>{" "}
              Management
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              Manage and organize your content
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filters */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white hover:bg-indigo-50"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>

            <select
              value={generationFilter}
              onChange={(e) => setGenerationFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white hover:bg-indigo-50"
            >
              <option value="all">All Types</option>
              <option value="ai">AI Generated</option>
              <option value="manual">Manual</option>
            </select>

            <Button
              onClick={() => navigate("/posts/new")}
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>

            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-indigo-50 transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {posts.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No posts found
                </h3>
                <p className="text-slate-600 text-center max-w-sm mb-6">
                  Get started by creating your first post
                </p>
                <Button
                  onClick={() => navigate("/posts/new")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => {
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
                  <div
                    key={post.id}
                    className="group relative bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-200/60 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Image Section */}
                    <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-indigo-100 via-cyan-50 to-violet-100">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="h-10 w-10 text-indigo-300 mx-auto mb-2" />
                            <span className="text-xs text-indigo-400 font-medium">No Image</span>
                          </div>
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Status badge on top of image */}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border backdrop-blur-sm ${statusClasses(post.status)}`}>
                          {getStatusIcon(post.status)}
                          <span className="capitalize">{post.status}</span>
                        </span>
                      </div>

                      {/* Right-side badges container */}
                      {(post.is_ai_generated || (post.review_status === "pending" && isPastSchedule)) && (
                        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                          {post.is_ai_generated && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-violet-100/90 border border-violet-300 text-violet-700 backdrop-blur-sm">
                              <Sparkles className="h-3 w-3" />
                              AI Generated
                            </span>
                          )}
                          {post.review_status === "pending" && isPastSchedule && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-red-100/90 border border-red-300 text-red-700 backdrop-blur-sm">
                              <Flame className="h-3 w-3" />
                              Expired
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content Section - Centered like reference */}
                    <div className="p-5 text-center flex flex-col flex-1">
                      {/* Platform badges */}
                      {getPlatformsArray(post.platforms).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 justify-center mb-3">
                          {getPlatformsArray(post.platforms).map((platform) => (
                            <span
                              key={platform}
                              className="inline-flex items-center bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-md capitalize"
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h5
                        className="text-lg font-semibold tracking-tight text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-700 transition-colors cursor-pointer"
                        onClick={() => navigate(`/posts/${post.id}`)}
                      >
                        {post.title}
                      </h5>

                      {/* Description */}
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {post.content}
                      </p>

                      {/* Schedule info */}
                      {post.scheduled_at && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5 mx-auto mb-4 border border-slate-100">
                          <Calendar className="h-3 w-3 text-indigo-400" />
                          <span>
                            {new Date(post.scheduled_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      )}

                      {/* Spacer to push buttons to bottom */}
                      <div className="flex-1" />

                      {/* Action buttons */}
                      <div className="flex items-center justify-center gap-2 flex-wrap pt-4 border-t border-slate-100">
                        {/* Primary View/Read More button - styled like reference */}
                        <button
                          onClick={() => navigate(`/posts/${post.id}`)}
                          className="inline-flex items-center text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 focus:ring-4 focus:ring-indigo-200 shadow-sm font-medium rounded-lg text-sm px-4 py-2 transition-all duration-200 hover:shadow-md"
                        >
                          View Post
                          <ArrowRight className="w-4 h-4 ml-1.5 -mr-0.5" />
                        </button>

                        {!showViewOnly && (
                          <>
                            {canApproveReject && (
                              <>
                                <button
                                  onClick={() => handleApprove(post.id)}
                                  className="inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 font-medium rounded-lg text-sm px-3 py-2 transition-all duration-200"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  Approve
                                </button>

                                <button
                                  onClick={() => handleReject(post.id)}
                                  className="inline-flex items-center text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 font-medium rounded-lg text-sm px-3 py-2 transition-all duration-200"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => navigate(`/posts/edit/${post.id}`)}
                              className="inline-flex items-center text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium rounded-lg text-sm px-3 py-2 transition-all duration-200"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </button>

                            <button
                              onClick={() => setDeletePostId(post.id)}
                              className="inline-flex items-center text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 font-medium rounded-lg text-sm px-3 py-2 transition-all duration-200"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {posts.length > 0 && (
            <Card className="mt-6 border-slate-200">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600">
                      Rows per page:
                    </span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="border border-slate-300 rounded-md px-2 py-1.5 text-sm bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {[6, 12, 25, 50, 100].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      variant="outline"
                      size="sm"
                      className="disabled:opacity-50"
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-slate-600 font-medium px-2">
                      Page {page} of {totalPages}
                    </span>

                    <Button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      variant="outline"
                      size="sm"
                      className="disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deletePostId}
        onOpenChange={() => setDeletePostId(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Delete Post
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This action cannot be undone. This will permanently delete the
              post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Posts;
