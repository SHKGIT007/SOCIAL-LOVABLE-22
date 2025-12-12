import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import { Zap } from "lucide-react";

const AdminViewPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  const fetchPostDetails = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getPostById(id);

      if (data.status) {
        setPost(data.data.post);
      } else {
        Swal.fire("Error", data.message || "Post not found", "error");
        navigate("/admin/posts");
      }
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed to fetch post", "error");
      navigate("/admin/posts");
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: platforms always return clean array
  const getPlatformsArray = (platforms: any) => {
    try {
      if (!platforms) return [];
      if (Array.isArray(platforms)) return platforms;
      return JSON.parse(platforms);
    } catch {
      return [];
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!post) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-muted-foreground mb-4">Post not found</p>
          <button
            onClick={() => navigate("/admin/posts")}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm border"
          >
            ← Back to Posts
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const platforms = getPlatformsArray(post.platforms);

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-2xl mx-auto py-8">
        <button
          className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm border"
          onClick={() => navigate("/admin/posts")}
        >
          ← Back
        </button>

        <Card className="border border-gray-200 bg-white shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b py-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-md">
                <Zap className="h-4 w-4 text-white" />
              </div>
              {post.title || "Untitled Post"}
            </CardTitle>

            <CardDescription className="text-gray-600">
              Posted by {post.User?.user_name} ({post.User?.email})
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* CONTENT */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Content
              </p>
              <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line shadow-inner">
                {post.content || "No text content"}
              </div>
            </div>

            {/* MEDIA */}
            {(post.image_url || post.video_url) && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Media Preview
                </p>

                {post.image_url && (
                  <div className="rounded-xl overflow-hidden border shadow-sm">
                    <img
                      src={post.image_url}
                      alt="post"
                      className="w-full max-h-[350px] object-cover"
                    />
                  </div>
                )}

                {post.video_url && (
                  <video
                    controls
                    className="w-full rounded-xl border shadow-sm max-h-[350px]"
                    src={post.video_url}
                  />
                )}
              </div>
            )}

            {/* BADGES */}
            <div className="flex flex-wrap gap-2 pt-2">
              {platforms.map((p: string, i: number) => (
                <Badge key={i} variant="outline">
                  {p}
                </Badge>
              ))}

              <Badge variant="secondary">Status: {post.status}</Badge>

              {post.is_ai_generated && (
                <Badge className="flex items-center gap-1 bg-indigo-100 text-indigo-800">
                  <Zap className="h-3 w-3" /> AI Generated
                </Badge>
              )}
            </div>

            {/* DATES FIXED */}
            <div className="text-xs text-gray-600 border-t pt-4 flex flex-col gap-1">
              <span>
                Created At: <strong>{formatDate(post.created_at)}</strong>
              </span>

              {post.scheduled_at && (
                <span>
                  Scheduled At: <strong>{formatDate(post.scheduled_at)}</strong>
                </span>
              )}

              {post.published_at && (
                <span>
                  Published At: <strong>{formatDate(post.published_at)}</strong>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminViewPost;
