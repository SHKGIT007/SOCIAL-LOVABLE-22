import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const AdminViewPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPostDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPostDetails = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getPostById(id);
      if (data.status === true) {
        setPost(data.data.post);
      } else {
        toast({
          title: "Error",
          description: data.message || "Post not found.",
          variant: "destructive",
        });
        navigate("/admin/posts");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch post.",
        variant: "destructive",
      });
      navigate("/admin/posts");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!post) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-muted-foreground mb-4">Post not found</p>
          <button
            onClick={() => navigate("/admin/posts")}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm border border-gray-300"
          >
            ← Back to Posts
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-2xl mx-auto py-8">
        <button
          className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm border border-gray-300"
          onClick={() => navigate("/admin/posts")}
        >
          ← Back
        </button>
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Title:</span> {post.title}
              </div>
              <div>
                <span className="font-semibold">Content:</span> {post.content}
              </div>
              <div>
                <span className="font-semibold">Platforms:</span>{" "}
                {post.platforms?.join(", ")}
              </div>
              <div>
                <span className="font-semibold">Status:</span>{" "}
                <Badge
                  variant={
                    post.status === "published"
                      ? "default"
                      : post.status === "scheduled"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {post.status}
                </Badge>
              </div>
              <div>
                <span className="font-semibold">Type:</span>{" "}
                <Badge variant="outline">
                  {post.is_ai_generated ? "AI" : "Manual"}
                </Badge>
              </div>
              <div>
                <span className="font-semibold">Created:</span>{" "}
                {new Date(post.created_at).toLocaleDateString()}
              </div>
              {post.User && (
                <div>
                  <span className="font-semibold">User:</span>{" "}
                  {post.User.user_name || "N/A"} ({post.User.email})
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminViewPost;
