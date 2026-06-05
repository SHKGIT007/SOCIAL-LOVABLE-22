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
import { formatDate, formatDateTime } from "@/utils/dateFormatter";
import { Zap } from "lucide-react";
import Swal from "sweetalert2";
import { getDisplayImageUrl } from "@/utils/imageHelper";

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
  const getPlatformsArray = (platforms: any): string[] => {
    if (!platforms) return [];

    // already array
    if (Array.isArray(platforms)) return platforms;

    // JSON string or other string format
    if (typeof platforms === "string") {
      try {
        const parsed = JSON.parse(platforms);
        if (Array.isArray(parsed)) return parsed;

        // If parsed is not an array, maybe it was a single string that's actually comma-separated
        return platforms
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
      } catch {
        // Not JSON, try as comma-separated string
        return platforms
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
      }
    }

    // object case { facebook: true, instagram: true }
    if (typeof platforms === "object") {
      return Object.keys(platforms);
    }

    return [];
  };

  // Utility will be used directly in JSX

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
      <div className="space-y-8 ">
        {/* Page Header (Same as AdminPosts) */}
        {/* Merged Sticky Header */}
        <div
          className="sticky top-0 z-10 -mx-2 px-4 py-4
  bg-gradient-to-b from-white/90 to-white/70
  backdrop-blur border-b border-indigo-100
  flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          {/* Left: Title */}
          <div>
            <h1 className="text-3xl font-extrabold leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                Posts
              </span>{" "}
              Details
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              View post information and content.
            </p>
          </div>

          {/* Right: Back Button */}
          <button
            onClick={() => navigate("/admin/posts")}
            className="self-start sm:self-auto px-4 py-2 text-sm rounded-md border bg-white hover:bg-indigo-50 transition"
          >
            ← Back
          </button>
        </div>

        {/* Main Card */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-indigo-500" />
                      {post.title || "Untitled Post"}
                    </h2>
                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-500">
                      <span className="font-medium text-gray-900">
                        {post.User?.Profile?.business_name || post.User?.user_name || "Unknown Creator"}
                      </span>
                      <span className="hidden sm:inline text-gray-300">•</span>
                      <span>{post.User?.email}</span>
                    </div>
                  </div>

                  <Badge variant="outline" className="bg-white">
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </Badge>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {platforms.map((p: string, i: number) => (
                    <Badge key={i} variant="secondary" className="capitalize bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
                      {p}
                    </Badge>
                  ))}

                  {post.is_ai_generated ? (
                    <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-white">
                      <Zap className="mr-1 h-3 w-3" />
                      AI Generated
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-300 text-gray-700 bg-white">
                      Manual
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="space-y-8 pt-6">
            {/* Content */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Post Content</h3>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 shadow-sm">
                <p className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm">
                  {post.content || <span className="text-gray-400 italic">No content available</span>}
                </p>
              </div>
            </section>

            {/* Media */}
            {(post.image_url || post.video_url) && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Media Preview
                </h3>
                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100/50 p-4 flex justify-center">
                  {post.image_url && (
                    <img
                      src={getDisplayImageUrl(post.image_url)}
                      alt="Post Media"
                      className="max-h-[400px] w-auto object-contain rounded-md shadow-sm border border-gray-200 bg-white"
                    />
                  )}

                  {post.video_url && !post.image_url && (
                    <video
                      controls
                      src={post.video_url}
                      className="max-h-[400px] w-full max-w-2xl rounded-md shadow-sm border border-gray-200 bg-black"
                    />
                  )}
                </div>
              </section>
            )}

            {/* Dates */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm flex flex-col justify-center">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Created At</h4>
                <p className="text-sm font-medium text-gray-900">
                  {formatDateTime(post.created_at)}
                </p>
              </div>

              {post.scheduled_at && (
                <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm flex flex-col justify-center">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Scheduled At
                  </h4>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateTime(post.scheduled_at)}
                  </p>
                </div>
              )}

              {post.published_at && (
                <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm flex flex-col justify-center">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Published At
                  </h4>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateTime(post.published_at)}
                  </p>
                </div>
              )}
            </section>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminViewPost;
