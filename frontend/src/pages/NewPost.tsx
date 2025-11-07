import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Swal from "sweetalert2";
import { Loader2, Sparkles, Image as ImageIcon, Film } from "lucide-react";
import { apiService } from "@/services/api";
import { isAuthenticated, logout } from "@/utils/auth";

const NewPost = () => {
  // States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageContent, setImageContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [status, setStatus] = useState("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accRes = await apiService.getMySocialAccounts();
        setConnectedAccounts(accRes.data.socialAccounts || []);
        const profileRes = await apiService.request("/profile");
        if (profileRes.status && profileRes.data?.profile) {
          const p = profileRes.data.profile;
          setTitle(p.business_name || "");
          let prompt = `Business/Creator: ${p.business_name}\nDescription: ${p.description}\nPlatforms: ${p.platforms}\nBrand Voice: ${p.brand_voice}\nHashtags: ${p.hashtags}\nImage Style: ${p.image_style}`;
          if (p.festival?.trim()) prompt += `\nFestival/Event: ${p.festival}`;
          setAiPrompt(prompt);
          setImagePrompt(p.image_style || "");
        }
      } catch {}
    };
    fetchData();
  }, []);

  const handlePlatformToggle = (platform: string) =>
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );

  const handleGenerateAI = async () => {
    if (!aiPrompt) {
      Swal.fire({ icon: "error", title: "Error", text: "Please enter your post prompt", confirmButtonColor: "#6366f1" });
      return;
    }
    setIsGenerating(true);
    try {
      const res = await apiService.generateAIPost({
        title: title || "AI Generated Post",
        ai_prompt: aiPrompt,
        image_prompt: imagePrompt,
      });
      if (res.status) {
        setContent(res.data.content);
        setImageContent(res.data.imageUrl);
        Swal.fire({ icon: "success", title: "Success", text: "AI post generated successfully!", confirmButtonColor: "#6366f1" });
      }
    } catch (err: any) {
      if (err.message === "Authentication failed") logout();
      else Swal.fire({ icon: "error", title: "Error", text: err.message || "Failed to generate post", confirmButtonColor: "#6366f1" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || platforms.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          !title
            ? "Please update your profile first."
            : !content
            ? "Please generate or enter content."
            : "Select at least one platform.",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (!isAuthenticated()) return navigate("/auth");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("platforms", JSON.stringify(platforms));
      formData.append("status", status);
      if (scheduledAt) formData.append("scheduled_at", scheduledAt);
      formData.append("is_ai_generated", String(mode === "ai"));
      if (aiPrompt) formData.append("ai_prompt", aiPrompt);
      if (imagePrompt) formData.append("image_prompt", imagePrompt);
      if (imageContent) formData.append("image_url", imageContent);
      if (imageFile) formData.append("image_file", imageFile);
      if (videoFile) formData.append("video_file", videoFile);

      const res = await apiService.createPost(formData, true);
      if (res.status) {
        Swal.fire({ icon: "success", title: "Success", text: "Post created successfully!", confirmButtonColor: "#6366f1" });
        navigate("/posts");
      }
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Failed to create post", confirmButtonColor: "#6366f1" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="client">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Create New Post
            </span>
          </h1>
          <p className="text-muted-foreground">Generate AI posts or create manually</p>
        </div>

        {/* Mode Tabs */}
        <div className="rounded-2xl border bg-white p-1 flex shadow-sm">
          {["ai", "manual"].map(m => (
            <button
              key={m}
              onClick={() => setMode(m as "ai" | "manual")}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${
                mode === m
                  ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md"
                  : "text-indigo-700 hover:bg-indigo-50"
              }`}
            >
              {m === "ai" ? "AI Generate" : "Manual Create"}
            </button>
          ))}
        </div>

        {/* AI Section */}
        {mode === "ai" && (
          <Card className="border-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" /> Generate Post with AI
              </CardTitle>
              <CardDescription>Use your brand profile and prompt to generate a post.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiPrompt && (
                <div className="space-y-1">
                  <Label>Context/Profile</Label>
                  <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap leading-relaxed">
                    {aiPrompt}
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateAI}
                disabled={isGenerating || !aiPrompt}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold shadow-md"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate Post with AI
                  </>
                )}
              </Button>

              {content && (
                <div className="space-y-4 border-t pt-4">
                  {imageContent && (
                    <img src={imageContent} alt="Generated" className="rounded-md border max-w-sm" />
                  )}
                  <Label>Edit Content</Label>
                  <Textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={8}
                    className="focus-visible:ring-indigo-500"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manual Section */}
        {mode === "manual" && (
          <Card className="border-indigo-100">
            <CardHeader>
              <CardTitle>Create Post Manually</CardTitle>
              <CardDescription>Write your own post content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Title *</Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter post title"
                  className="focus-visible:ring-indigo-500"
                />
              </div>

              <div>
                <Label>Content *</Label>
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={8}
                  placeholder="Write your post content"
                  className="focus-visible:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-indigo-600" /> Image Upload
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      setImageFile(file || null);
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => setImagePreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      } else setImagePreview("");
                    }}
                  />
                  {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 rounded-md border max-w-xs" />}
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-indigo-600" /> Video Upload
                  </Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      setVideoFile(file || null);
                      setVideoPreview(file ? URL.createObjectURL(file) : "");
                    }}
                  />
                  {videoPreview && <video src={videoPreview} controls className="mt-2 rounded-md border max-w-xs" />}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

     <Card className="border-indigo-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">Post Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-gray-700">Platforms *</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {connectedAccounts.length === 0 ? (
                  <p className="text-gray-500">No social accounts connected.</p>
                ) : (
                  connectedAccounts.map(acc => (
                    <div key={acc.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={platforms.includes(acc.platform)}
                        onCheckedChange={() => handlePlatformToggle(acc.platform)}
                      />
                      <label className="text-sm font-medium text-gray-700">
                        {acc.platform} {acc.account_name ? `(${acc.account_name})` : ""}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="border-gray-300 focus-visible:ring-indigo-500">
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
              <div>
                <Label className="text-gray-700">Schedule Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="border-gray-300 focus-visible:ring-indigo-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => navigate("/posts")} className="text-indigo-600 border-indigo-200">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold shadow-md"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Post
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewPost;
