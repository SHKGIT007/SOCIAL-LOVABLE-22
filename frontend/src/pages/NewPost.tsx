import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { apiService } from "@/services/api";
import { isAuthenticated, logout } from "@/utils/auth";
import { marked } from "marked";

const NewPost = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual post fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [imageContent, setImageContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [status, setStatus] = useState("draft");
  const [scheduledAt, setScheduledAt] = useState("");

  // AI generation fields
  const [aiPrompt, setAiPrompt] = useState("");
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [imagePrompt, setImagePrompt] = useState("");

  useEffect(() => {
    const fetchAccountsAndProfile = async () => {
      try {
        const accRes = await apiService.getMySocialAccounts();
        setConnectedAccounts(accRes.data.socialAccounts || []);
        // Fetch profile details and set aiPrompt
        const profileRes = await apiService.request("/profile");
        if (profileRes.status && profileRes.data?.profile) {
          const p = profileRes.data.profile;
          setTitle(p.business_name || "");
          // Build prompt from profile fields
          const prompt = `Business/Creator: ${p.business_name}\nDescription: ${p.description}\nPlatforms: ${p.platforms}\nBrand Voice: ${p.brand_voice}\nHashtags: ${p.hashtags}\nImage Style: ${p.image_style}`;
          setAiPrompt(prompt);
        }
      } catch (error) {
        // Optionally show error
      }
    };
    fetchAccountsAndProfile();
  }, []);

  const handlePlatformToggle = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt) {
      toast({
        title: "Error",
        description: "Please enter your post prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiService.generateAIPost({
        title: title || "AI Generated Post",
        ai_prompt: aiPrompt,
        image_prompt: imagePrompt
      });

      if (response.status) {
        setContent(response.data.content);
        setImageContent(response.data.imageUrl);
        toast({
          title: "Success",
          description: "AI post generated successfully!",
        });
      }
    } catch (error: any) {
      if (error.message === 'Authentication failed') {
        logout();
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to generate AI post",
          variant: "destructive",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast({
        title: "Error",
        description: "Please fill title",
        variant: "destructive",
      });
      return;
    }
   if (!content) {
      toast({
        title: "Error",
        description: "Please generate post content",
        variant: "destructive",
      });
      return;
    }

    if(platforms.length === 0){
      toast({
        title: "Error",
        description: "Please connect and select at least one social platform",
        variant: "destructive",
      });
      return;
    }



    setIsLoading(true);
    try {
      if (!isAuthenticated()) {
        navigate("/auth");
        return;
      }

      const response = await apiService.createPost({
        title,
        content,
        platforms,
        status,
        scheduled_at: scheduledAt || null,
        is_ai_generated: isGenerating || aiPrompt !== "",
        ai_prompt: aiPrompt || null,
        image_prompt: imagePrompt || null,
        image_url: imageContent || null,
      });

      if (response.status) {
        toast({
          title: "Success",
          description: "Post created successfully!",
        });
        navigate("/posts");
      }
    } catch (error: any) {
      if (error.message === 'Authentication failed') {
        logout();
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create post",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="client">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
          <p className="text-muted-foreground">Generate AI posts or create manually</p>
        </div>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">AI Generate</TabsTrigger>
            <TabsTrigger value="manual">Manual Create</TabsTrigger>
          </TabsList>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>Generate Post with AI</CardTitle>
                <CardDescription>
                  Answer these questions to generate an engaging post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Removed unused AI input fields. Only prompt and imagePrompt remain. */}

                
                <div className="space-y-2">
                  <Label htmlFor="imagePrompt">Image Prompt (Optional)</Label>
                  <Input
                    id="imagePrompt"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Enter image prompt"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !aiPrompt}
                  className="w-full"
                >
                  {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {!isGenerating && <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Post with AI
                </Button>

                {content && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      
                      {/* HTML Preview */}
                      <div
                        id="generated-content-preview"
                        style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', border: '1px solid #eee', marginBottom: '1rem' }}
                        dangerouslySetInnerHTML={{ __html: imageContent ? `<img src="${imageContent}" alt="Generated" style="max-width: 100%; height: auto; margin-bottom: 1rem;" />` : '' }}
                      />
                      {/* Editable textarea if user wants to change */}
                      <Label htmlFor="generated-content-edit">Edit Content</Label>
                      <Textarea
                        id="generated-content-edit"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        style={{ marginTop: '1rem' }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Create Post Manually</CardTitle>
                <CardDescription>Write your own post content</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-title">Title *</Label>
                    <Input
                      id="manual-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter post title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manual-content">Content *</Label>
                    <Textarea
                      id="manual-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your post content"
                      rows={8}
                      required
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Common fields for both AI and Manual */}
        <Card>
          <CardHeader>
            <CardTitle>Post Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Platforms *</Label>
              <div className="flex flex-wrap gap-4">
                {connectedAccounts.length === 0 ? (
                  <p className="text-muted-foreground">No social accounts connected. Connect from dashboard.</p>
                ) : (
                  connectedAccounts.map((acc) => (
                    <div key={acc.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={acc.platform}
                        checked={platforms.includes(acc.platform)}
                        onCheckedChange={() => handlePlatformToggle(acc.platform)}
                      />
                      <label
                        htmlFor={acc.platform}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {acc.platform} {acc.account_name ? `(${acc.account_name})` : ""}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === "scheduled" && (
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Schedule Date & Time</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/posts")}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Post
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewPost;