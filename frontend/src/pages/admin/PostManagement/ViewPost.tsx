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
        <Card className="overflow-hidden rounded-2xl border-indigo-100 shadow-xl">
          {/* Gradient banner */}
          <div className="relative">
            <div className="h-24 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500" />

            {post.image_url && (
              <div className="absolute -bottom-10 left-6">
                <div className="h-20 w-20 rounded-xl overflow-hidden ring-4 ring-white shadow-lg bg-white">
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Header */}
          <CardHeader className={`pt-6 ${post.image_url ? "pl-28" : ""}`}>
            <div className="space-y-4">
              {/* Creator Info Above Title */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Business / Creator Name
                </span>
                <span className="text-xl font-extrabold text-gray-900">
                  {post.User?.Profile?.business_name || post.User?.user_name || "Unknown Creator"}
                </span>
                <span className="text-xs text-gray-500 font-medium italic">
                  ({post.User?.email})
                </span>
              </div>

              <div className="h-px bg-gray-100" />

              <CardTitle className="text-2xl tracking-tight text-gray-800 flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-500" />
                {post.title || "Untitled Post"}
              </CardTitle>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {platforms.map((p: string, i: number) => (
                  <Badge key={i} variant="secondary" className="capitalize">
                    {p}
                  </Badge>
                ))}

                <Badge className="bg-gray-700 text-white">
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </Badge>

                {post.is_ai_generated ? (
                  <Badge
                    variant="outline"
                    className="border-indigo-200 text-indigo-700"
                  >
                    <Zap className="mr-1 h-3 w-3" />
                    AI Generated
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-gray-300 text-gray-700"
                  >
                    Manual
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="space-y-8">
            {/* Content */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Content</h3>
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {post.content || "No content available"}
                </p>
              </div>
            </section>

            {/* Media */}
            {(post.image_url || post.video_url) && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Media Preview
                </h3>

                {post.image_url && (
                  <div className="rounded-2xl overflow-hidden border shadow-sm bg-gray-50">
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="w-auto max-h-72 object-contain"
                    />
                  </div>
                )}

                {post.video_url && (
                  <video
                    controls
                    src={post.video_url}
                    className="w-full max-h-72 rounded-xl border shadow-sm"
                  />
                )}
              </section>
            )}

            {/* Dates */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="rounded-xl border p-4 bg-white shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-1">Created At</h4>
                <p className="text-sm text-gray-600">
                  {formatDateTime(post.created_at)}
                </p>
              </div>

              {post.scheduled_at && (
                <div className="rounded-xl border p-4 bg-white shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Scheduled At
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(post.scheduled_at)}
                  </p>
                </div>
              )}

              {post.published_at && (
                <div className="rounded-xl border p-4 bg-white shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Published At
                  </h4>
                  <p className="text-sm text-gray-600">
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
