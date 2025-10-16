import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import ApiService from "@/services/api"; // Removed default import
import { apiService } from "@/services/api";
import { isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statuses = ["draft", "scheduled", "published"];

interface FormData {
  title: string;
  content: string;
  platforms: string[];
  status: string;
  scheduled_at: string;
  category: string;
  tags: string;
  image_prompt: string | null;
  image_url: string | null; 
}

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    platforms: [],
    status: "draft",
    scheduled_at: "",
    category: "",
    tags: "",
    image_prompt: "",
    image_url: "",
  });
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      await fetchPost();
      try {
        const accRes = await apiService.getMySocialAccounts();
        setConnectedAccounts(accRes.data.socialAccounts || []);
        // Fetch profile details and set image_prompt if post is AI-generated
        const profileRes = await apiService.request("/profile");
        if (profileRes.status && profileRes.data?.profile) {
          const p = profileRes.data.profile;
          // If post is AI-generated, fill image_prompt and other fields from profile
          setFormData((prev) => ({
            ...prev,
            image_prompt: prev.image_prompt || p.image_style || "",
            // Optionally set other fields like brand_voice, hashtags, etc. if needed
          }));
        }
      } catch (error) {
        // Optionally show error
      }
    };
    fetchAll();
  }, [id]);

  const fetchPost = async () => {
    try {
      if (!isAuthenticated()) {
        navigate("/auth");
        return;
      }
      // const api = new ApiService();
      // const data = await api.getPostById(id);
      const data = await apiService.getPostById(id);
      console.log("Fetched post data: ", data);
    
      if(data.status === false) {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch post.",
          variant: "destructive",
        });
        navigate("/posts");
        return;
      }else if (!data.data || !data.data.post) {
        toast({
          title: "Error",
          description: "Post not found.",
          variant: "destructive",
        });
        navigate("/posts");
        return;
      }
      const dataPost = data.data.post;
      setFormData({
        title: dataPost.title,
        content: dataPost.content,
        platforms: dataPost.platforms,
        status: dataPost.status,
        scheduled_at: dataPost.scheduled_at
          ? new Date(dataPost.scheduled_at).toISOString().slice(0, 16)
          : "",
        category: dataPost.category || "",
        tags: dataPost.tags ? dataPost.tags.join(", ") : "",
        image_prompt: dataPost.image_prompt || null,
        image_url: dataPost.image_url || null
      });



    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch post.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (formData.platforms.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one platform.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const updateData = {
        title: formData.title,
        content: formData.content,
        platforms: formData.platforms,
        status: formData.status,
        scheduled_at: formData.scheduled_at || null,
        category: formData.category || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        image_prompt: formData.image_prompt || null,
        image_url : formData.image_url
      };

      // const api = new ApiService();
      // await api.updatePost(id, updateData);

       await apiService.updatePost(id, updateData);

      toast({
        title: "Success",
        description: "Post updated successfully!",
      });

      navigate("/posts");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update post.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/posts")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Post</CardTitle>
            <CardDescription>Update your post details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Write your post content..."
                  className="min-h-[200px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Marketing, Product Update"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional, comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="e.g., social media, announcement, sale"
                />
              </div>

              <div className="space-y-2">
                <Label>Select Platforms</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {connectedAccounts.length === 0 ? (
                    <p className="text-muted-foreground">No social accounts connected. Connect from dashboard.</p>
                  ) : (
                    connectedAccounts.map((acc) => (
                      <div key={acc.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={acc.platform}
                          checked={formData.platforms.includes(acc.platform)}
                          onCheckedChange={() => handlePlatformToggle(acc.platform)}
                        />
                        <Label htmlFor={acc.platform} className="cursor-pointer">
                          {acc.platform} {acc.account_name ? `(${acc.account_name})` : ""}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.status === "scheduled" && (
                <div className="space-y-2">
                  <Label htmlFor="scheduled_at">Schedule Date & Time</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduled_at: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/posts")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EditPost;
