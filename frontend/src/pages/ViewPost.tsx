import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "@/services/api";
import { isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertTitle } from "@/components/ui/alert";

interface Post {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  is_ai_generated: boolean;
  ai_prompt: string | null;
  category: string | null;
  tags: string[] | null;
  media_urls: string[] | null;
  created_at: string;
  updated_at: string;
}

const ViewPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log("Post ID from ppostarams: ", post);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      if (!isAuthenticated()) {
        navigate("/auth");
        return;
      }

      // const api = new ApiService();
      const data = await apiService.getPostById(id);
      // const data = await api.getPostById(id);
      if(data.status === true) {
         setPost(data.data.post);
      }else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch post.",
          variant: "destructive",
        });
        navigate("/posts");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch post.",
        variant: "destructive",
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/posts")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
          <Button onClick={() => navigate(`/posts/edit/${post.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Post
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl">{post.title}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(post.status)}>
                    {post.status}
                  </Badge>
                  {post.is_ai_generated && (
                    <Badge variant="outline">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI Generated
                    </Badge>
                  )}
                  {post.category && (
                    <Badge variant="secondary">{post.category}</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Content</h3>
              <p className="whitespace-pre-wrap text-muted-foreground">{post.content}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {
                post?.platforms?.map((platform) => (
                  <Badge key={platform} variant="secondary">
                    {platform}
                  </Badge>
                ))
                }
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post?.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {post.media_urls && post.media_urls.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Media</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {post.media_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="rounded-lg w-full h-32 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {post.ai_prompt && (
              <div>
                <h3 className="font-semibold mb-2">AI Prompt Used</h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {post.ai_prompt}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              {post.scheduled_at && (
                <div>
                  <h3 className="font-semibold mb-1 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Scheduled For
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.scheduled_at).toLocaleString()}
                  </p>
                </div>
              )}

              {post.published_at && (
                <div>
                  <h3 className="font-semibold mb-1">Published At</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.published_at).toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-1">Created</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Last Updated</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ViewPost;
