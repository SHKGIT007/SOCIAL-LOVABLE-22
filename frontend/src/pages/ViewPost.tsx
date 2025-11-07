import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "@/services/api";
import { isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, Sparkles } from "lucide-react";
import Swal from "sweetalert2";

interface Post {
  id: string;
  title: string;
  content: string;
  platforms: string[] | string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  is_ai_generated: boolean;
  ai_prompt: string | null;
  category: string | null;
  tags: string[] | null;
  media_urls: string[] | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

const ViewPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPost = async () => {
    try {
      if (!isAuthenticated()) {
        navigate("/auth");
        return;
      }
      const data = await apiService.getPostById(id);
      if (data.status === true) {
        setPost(data.data.post);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to fetch post.",
          confirmButtonColor: "#6366f1",
        });
        navigate("/posts");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch post.",
        confirmButtonColor: "#6366f1",
      });
      navigate("/posts");
    } finally {
      setIsLoading(false);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!post) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-muted-foreground mb-4">Post not found</p>
          <Button onClick={() => navigate("/posts")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Always return string[]
  const getPlatformsArray = (platforms: string[] | string | undefined): string[] => {
    if (Array.isArray(platforms)) return platforms;
    if (typeof platforms === "string" && platforms) return platforms.split(",").map((p) => p.trim()).filter(Boolean);
    return [];
  };

  return (
    <DashboardLayout userRole="client">
      <div className=" space-y-8">
        {/* Sticky action bar */}
        <div className="sticky top-0 z-10 -mx-2 px-2 py-3 bg-gradient-to-b from-white/85 to-white/60 backdrop-blur supports-[backdrop-filter]:backdrop-blur rounded-b-xl border-b border-indigo-50 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/posts")} className="hover:bg-indigo-50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
          <Button
            onClick={() => navigate(`/posts/edit/${post.id}`)}
            className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-md"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Post
          </Button>
        </div>

        {/* Hero header card */}
        <Card className="overflow-hidden rounded-2xl border-indigo-100/70 shadow-xl">
          {/* Gradient banner with optional cover thumbnail */}
          <div className="relative">
            <div className="h-24 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500" />
            {post.image_url && (
              <div className="absolute -bottom-10 left-6">
                <div className="h-20 w-20 rounded-xl overflow-hidden ring-4 ring-white shadow-lg bg-white">
                  <img
                    src={post.image_url}
                    alt="Cover"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/no-image.png";
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <CardHeader className={`pt-6 ${post.image_url ? "pl-28" : ""}`}>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-3xl tracking-tight text-gray-900">{post.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={`${getStatusColor(post.status)} text-white`}>{post.status}</Badge>
                {post.is_ai_generated && (
                  <Badge variant="outline" className="border-indigo-200 text-indigo-700">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI Generated
                  </Badge>
                )}
                {post.category && <Badge variant="secondary">{post.category}</Badge>}
              </div>
              <CardDescription>Detailed post view with content, media and schedule info.</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Content block */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Content</h3>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{post.content}</p>
              </div>
            </section>

            {/* Featured image (bigger preview below, if needed) */}
            {post.image_url && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Featured Image</h3>
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full max-h-[520px] object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/no-image.png";
                    }}
                  />
                </div>
              </section>
            )}

            {/* Platforms */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {getPlatformsArray(post.platforms).map((p) => (
                  <Badge key={p} variant="secondary" className="capitalize">
                    {p}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-gray-300">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Media gallery */}
            {Array.isArray(post.media_urls) && post.media_urls.filter(Boolean).length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Media</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {post.media_urls
                    .filter(Boolean)
                    .map((url, idx) => (
                      <div
                        key={idx}
                        className="group rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 aspect-[4/3]"
                      >
                        <img
                          src={url as string}
                          alt={`Media ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/no-image.png";
                          }}
                        />
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Prompt (if any) */}
            {post.ai_prompt && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Prompt Used</h3>
                <p className="text-sm text-gray-600 bg-gradient-to-br from-slate-50 to-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  {post.ai_prompt}
                </p>
              </section>
            )}

            {/* Meta grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              {post.scheduled_at && (
                <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                  <h4 className="font-semibold mb-1 flex items-center text-gray-900">
                    <Calendar className="mr-2 h-4 w-4 text-indigo-600" />
                    Scheduled For
                  </h4>
                  <p className="text-sm text-gray-600">{new Date(post.scheduled_at).toLocaleString()}</p>
                </div>
              )}

              {post.published_at && (
                <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                  <h4 className="font-semibold mb-1 text-gray-900">Published At</h4>
                  <p className="text-sm text-gray-600">{new Date(post.published_at).toLocaleString()}</p>
                </div>
              )}

              <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                <h4 className="font-semibold mb-1 text-gray-900">Created</h4>
                <p className="text-sm text-gray-600">{new Date(post.created_at).toLocaleString()}</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                <h4 className="font-semibold mb-1 text-gray-900">Last Updated</h4>
                <p className="text-sm text-gray-600">{new Date(post.updated_at).toLocaleString()}</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ViewPost;
