import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Swal from "sweetalert2";
import {
  Loader2,
  Sparkles,
  Image as ImageIcon,
  AlertCircle,
  Facebook,
  Instagram,
} from "lucide-react";
import { apiService } from "@/services/api";
import { isAuthenticated } from "@/utils/auth";

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
  const [autoToggle, setAutoToggle] = useState(false);

  const [optionalContentPrompt, setOptionalContentPrompt] = useState("");
  const [optionalImagePrompt, setOptionalImagePrompt] = useState("");
  const [optionalTitlePrompt, setOptionalTitlePrompt] = useState("");

  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accRes = await apiService.getMySocialAccounts();
        const activeAccs = (accRes.data.socialAccounts || []).filter(
          (acc: any) => acc.is_active && acc.access_token
        );
        setConnectedAccounts(activeAccs);

        const profileRes = await apiService.request("/profile");
        if (profileRes.status && profileRes.data?.profile) {
          const p = profileRes.data.profile;
          setTitle(p.business_name || "");
          let prompt = `Business/Creator: ${p.business_name}\nDescription: ${p.description}\nPlatforms: ${p.platforms}\nBrand Voice: ${p.brand_voice}\nHashtags: ${p.hashtags}`;
          if (p.festival?.trim()) prompt += `\nFestival/Event: ${p.festival}`;
          setAiPrompt(prompt);
          setImagePrompt(p.image_style || "");
          setProfileLoaded(true);
        }
      } catch (error) {
      }
    };
    fetchData();
  }, []);

  const handlePlatformToggle = (platform: string) =>
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );

  const handleGenerateAI = async () => {
    // Check if profile is loaded and prompt is available
    if (!profileLoaded || !aiPrompt.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Profile Update Required",
        text: "Please complete your profile before generating AI content.",
        confirmButtonColor: "#6366f1",
        showCancelButton: true,
        cancelButtonText: "Later",
        confirmButtonText: "Go to Profile",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/profile");
        }
      });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await apiService.generateAIPost({
        title: optionalTitlePrompt?.trim() || title,
        ai_prompt: optionalContentPrompt?.trim() || aiPrompt,
        image_prompt: optionalImagePrompt?.trim() || imagePrompt,
      });

      if (res.status) {
        setContent(res.data.content || "");
        setImageContent(res.data.imageUrl || "");

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "AI post generated successfully!",
          confirmButtonColor: "#6366f1",
          timer: 2000,
        });
      } else {
        throw new Error(res.message || "Failed to generate post");
      }
    } catch (err: any) {

      // Extract error message
      let errorMessage = "Failed to generate post. Please try again.";

      if (err?.response?.data) {
        errorMessage =
          err.response.data.message || err.response.data.error || errorMessage;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      // Show detailed error with action buttons
      Swal.fire({
        icon: "error",
        title: "Generation Failed",
        html: `
          <div style="text-align: left; margin: 20px 0;">
            <p style="color: #dc2626; font-weight: 600; margin-bottom: 10px;">
              ${errorMessage}
            </p>
            ${errorMessage.includes("subscription")
            ? '<p style="color: #6b7280; font-size: 14px;"></p>'
            : ""
          }
          </div>
        `,
        confirmButtonColor: "#6366f1",
        confirmButtonText: errorMessage.includes("subscription")
          ? "View Plans"
          : "OK",
        showCancelButton: errorMessage.includes("subscription"),
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed && errorMessage.includes("subscription")) {
          navigate("/plans");
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if any platforms are connected when publishing or scheduling
    if ((status === "published" || status === "scheduled") && connectedAccounts.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Social Accounts Connected",
        text: "You must connect at least one social media account (Facebook or Instagram) before you can publish or schedule posts.",
        confirmButtonColor: "#6366f1",
        showCancelButton: true,
        confirmButtonText: "Connect Account",
        cancelButtonText: "Later",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/social-accounts");
        }
      });
      return;
    }

    // Validation
    if (!title || !content || ((status === "published" || status === "scheduled") && platforms.length === 0)) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: !title
          ? "Please update your profile first to set a business name."
          : !content
            ? "Please generate or enter content for your post."
            : "Please select at least one platform to publish this post.",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    if (status === "scheduled") {
      if (!scheduledAt) {
        Swal.fire({
          icon: "error",
          title: "Schedule Required",
          text: "Please select a date & time for scheduled post.",
          confirmButtonColor: "#6366f1",
        });
        return;
      }

      const selected = new Date(scheduledAt);
      const now = new Date();

      if (isNaN(selected.getTime()) || selected <= now) {
        Swal.fire({
          icon: "error",
          title: "Invalid Schedule Time",
          text: "Please choose a valid future date and time.",
          confirmButtonColor: "#6366f1",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      if (!isAuthenticated()) {
        navigate("/auth");
        return;
      }

      const formData = new FormData();
      const finalTitle = optionalTitlePrompt?.trim() || title;
      formData.append("title", finalTitle);
      formData.append("content", content);
      formData.append("platforms", JSON.stringify(platforms));
      formData.append("status", status);

      if (scheduledAt) formData.append("scheduled_at", scheduledAt);
      formData.append("is_ai_generated", String(mode === "ai"));

      const finalAiPrompt = optionalContentPrompt?.trim() || aiPrompt;
      const finalImagePrompt = optionalImagePrompt?.trim() || imagePrompt;

      if (finalAiPrompt) formData.append("ai_prompt", finalAiPrompt);
      if (finalImagePrompt) formData.append("image_prompt", finalImagePrompt);
      if (imageContent) formData.append("image_url", imageContent);
      if (imageFile) formData.append("image_file", imageFile);
      if (videoFile) formData.append("video_file", videoFile);

      // Set review_status based on status
      let reviewStatus = "pending";
      if (status === "scheduled") {
        reviewStatus = autoToggle ? "pending" : "approved";
      } else if (status === "published") {
        reviewStatus = "approved";
      }

      formData.append("review_status", reviewStatus);

      const res = await apiService.createPost(formData, true);

      if (res.status) {
        const successMessage =
          status === "published"
            ? "Post published successfully!"
            : status === "scheduled"
              ? "Post scheduled successfully!"
              : "Post saved as draft!";

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: successMessage,
          confirmButtonColor: "#6366f1",
          timer: 2000,
        });

        navigate("/posts");
      }
    } catch (err: any) {

      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create post. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="client">
      <div className="max-w-4xl mx-auto space-y-8 pb-8">
        {/* Header */}
        <div className="px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Create New Post
            </span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Generate AI posts or create manually
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="rounded-2xl border bg-white p-1 flex shadow-sm mx-2 sm:mx-0">
          {["ai", "manual"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m as "ai" | "manual");
                if (m === "manual") setContent("");
              }}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${mode === m
                ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md"
                : "text-indigo-700 hover:bg-indigo-50"
                }`}
            >
              {m === "ai" ? "🤖 AI Generate" : "✍️ Manual Create"}
            </button>
          ))}
        </div>

        {/* AI Section */}
        {mode === "ai" && (
          <Card className="border-indigo-100 shadow-sm">
            {/* <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50">
              <CardTitle className="text-indigo-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Content Generator
              </CardTitle>
              <CardDescription>
                Customize the AI generation or use your profile defaults
              </CardDescription>
            </CardHeader> */}
            <CardContent className="space-y-5 mt-6">
              {/* Info Banner */}
              {!profileLoaded && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">
                      Profile setup required
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Please complete your profile to use AI generation
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate("/profile")}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Setup Profile
                  </Button>
                </div>
              )}

              {/* Optional Title Prompt */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Optional Business/Creator Name
                </label>
                <Input
                  type="text"
                  value={optionalTitlePrompt}
                  onChange={(e) => setOptionalTitlePrompt(e.target.value)}
                  className="focus-visible:ring-indigo-500"
                  placeholder={title || "Add custom title for this post..."}
                />
                {/* {title && !optionalTitlePrompt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Using profile default: {title}
                  </p>
                )} */}
              </div>

              {/* Optional Content Prompt */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Optional Description / Content Instructions
                </label>
                <Textarea
                  value={optionalContentPrompt}
                  onChange={(e) => setOptionalContentPrompt(e.target.value)}
                  className="focus-visible:ring-indigo-500"
                  rows={3}
                  placeholder="Add extra instructions for AI content generation..."
                />
                {/* {!optionalContentPrompt && aiPrompt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Using profile prompt (click to expand)
                  </p>
                )} */}
              </div>

              {/* Optional Image Prompt */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Optional Image Generation Prompt
                </label>
                <Textarea
                  value={optionalImagePrompt}
                  onChange={(e) => setOptionalImagePrompt(e.target.value)}
                  className="focus-visible:ring-indigo-500"
                  rows={2}
                  placeholder="Describe the image you want AI to generate..."
                />
                {/* {imagePrompt && !optionalImagePrompt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Using profile default: {imagePrompt}
                  </p>
                )} */}
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateAI}
                disabled={isGenerating || !profileLoaded}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold shadow-md text-base"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Amazing Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Post with AI
                  </>
                )}
              </Button>

              {/* Generated Content Preview */}
              {content && (
                <div className="space-y-4 border-t pt-6 mt-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold text-gray-800">
                      Generated Content
                    </Label>
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Generated Successfully
                    </span>
                  </div>

                  {imageContent && (
                    <div className="rounded-lg overflow-hidden border-2 border-indigo-100">
                      <img
                        src={imageContent}
                        alt="AI Generated"
                        className="w-full max-w-md mx-auto"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Edit Caption
                    </Label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={10}
                      className="focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manual Section */}
        {mode === "manual" && (
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50">
              <CardTitle className="text-indigo-900">
                Create Post Manually
              </CardTitle>
              <CardDescription>
                Write your own post content and upload media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 mt-6">
              <div>
                <Label className="flex items-center gap-2 mb-4">
                  Business/Creator Name *
                </Label>
                <Input
                  // value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter business or creator name"
                  className="focus-visible:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-4">
                  Post Content *
                </Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder="Write your post content here..."
                  className="focus-visible:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center gap-2 mb-4">
                    <ImageIcon className="h-4 w-4 text-indigo-600" />
                    Image Upload (Optional)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setImageFile(file || null);
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) =>
                          setImagePreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      } else {
                        setImagePreview("");
                      }
                    }}
                    className="cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-3 rounded-lg overflow-hidden border-2 border-indigo-100">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Post Settings */}
        <Card className="border-indigo-100 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50">
            <CardTitle className="text-indigo-900">Post Settings</CardTitle>
            <CardDescription>
              Configure platforms, status, and scheduling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 mt-6">
            {/* Platforms */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-900 font-bold text-lg flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  Select Platforms
                </Label>
                {platforms.length > 0 && (
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    {platforms.length} Selected
                  </Badge>
                )}
              </div>

              {connectedAccounts.length === 0 ? (
                <div className="relative overflow-hidden p-6 bg-amber-50/50 border border-amber-200 rounded-2xl group transition-all hover:shadow-md">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                    <AlertCircle className="h-24 w-24 text-amber-600 rotate-12" />
                  </div>
                  <div className="relative flex flex-col sm:flex-row items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl">
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-lg font-bold text-amber-900">
                        No social accounts connected
                      </p>
                      <p className="text-sm text-amber-700 mt-1 max-w-md">
                        Your post needs a destination. Connect your Facebook or Instagram accounts to start sharing.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => navigate("/social-accounts")}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-200/50 whitespace-nowrap"
                    >
                      Connect Now
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connectedAccounts.map((acc) => {
                    const isSelected = platforms.includes(acc.platform);
                    const isFacebook = acc.platform.toLowerCase() === "facebook";
                    const isInstagram = acc.platform.toLowerCase() === "instagram";

                    return (
                      <div
                        key={acc.id}
                        onClick={() => handlePlatformToggle(acc.platform)}
                        className={`group relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${isSelected
                          ? isFacebook
                            ? "border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100"
                            : "border-pink-500 bg-pink-50/50 shadow-lg shadow-pink-100"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50 bg-white"
                          }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2.5 rounded-xl transition-colors ${isSelected
                            ? isFacebook ? "bg-blue-600 text-white" : "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white"
                            : "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                            }`}>
                            {isFacebook ? <Facebook className="h-5 w-5" /> : <Instagram className="h-5 w-5" />}
                          </div>

                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isSelected
                            ? isFacebook ? "bg-blue-600 border-blue-600" : "bg-pink-600 border-pink-600"
                            : "border-gray-300"
                            }`}>
                            {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h3 className={`font-bold text-base transition-colors ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                            {acc.platform}
                          </h3>
                          {acc.account_name && (
                            <p className={`text-xs font-medium transition-colors ${isSelected ? "text-indigo-600" : "text-gray-500"}`}>
                              @{acc.account_name}
                            </p>
                          )}
                        </div>

                        {/* Status Indicator */}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Connected</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <Label className="text-gray-900 font-semibold mb-3 block">
                Post Status *
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="border-gray-300 focus-visible:ring-indigo-500 h-11">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">💾 Save as Draft</SelectItem>
                  <SelectItem value="scheduled">
                    📅 Schedule for Later
                  </SelectItem>
                  <SelectItem value="published">🚀 Publish Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Schedule Settings */}
            {status === "scheduled" && (
              <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div>
                  <Label className="text-gray-900 font-semibold mb-2 block">
                    Schedule Date & Time *
                  </Label>
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="border-indigo-300 focus-visible:ring-indigo-500"
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>

                {/* Review Toggle */}
                <div className="flex items-center justify-between p-3 bg-white border-2 border-indigo-200 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-900 block">
                      Review Before Publishing
                    </span>
                    <span className="text-xs text-gray-600">
                      {autoToggle
                        ? "Post will be reviewed before publishing"
                        : "Post will auto-publish at scheduled time"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoToggle(!autoToggle)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${autoToggle ? "bg-indigo-600" : "bg-gray-300"
                      }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${autoToggle ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/posts")}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || (status !== "draft" && !content)}
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold shadow-md px-8"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {status === "published"
                  ? "🚀 Publish Now"
                  : status === "scheduled"
                    ? "📅 Schedule Post"
                    : "💾 Save Draft"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewPost;
