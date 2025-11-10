// Helper to convert UTC ISO string to local datetime-local format
function toLocalDatetimeLocal(isoString: string) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
// Helper to convert UTC/ISO to Asia/Kolkata local datetime-local format
function toKolkataDatetimeLocal(isoString: string) {
  if (!isoString) return "";
  const date = new Date(isoString);
  // Convert to Asia/Kolkata time
  const kolkataDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  // Format as YYYY-MM-DDTHH:mm
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${kolkataDate.getFullYear()}-${pad(kolkataDate.getMonth() + 1)}-${pad(kolkataDate.getDate())}T${pad(kolkataDate.getHours())}:${pad(kolkataDate.getMinutes())}`;
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import Swal from "sweetalert2";
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
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      await fetchPost();
      try {
        const accRes = await apiService.getMySocialAccounts();
        setConnectedAccounts(accRes.data.socialAccounts || []);
        const profileRes = await apiService.request("/profile");
        if (profileRes.status && profileRes.data?.profile) {
          const p = profileRes.data.profile;
          setFormData((prev) => ({
            ...prev,
            image_prompt: prev.image_prompt || p.image_style || "",
          }));
        }
      } catch {
        // optional
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPost = async () => {
    try {
      if (!isAuthenticated()) {
        navigate("/auth");
        return;
      }
      const data = await apiService.getPostById(id);
      if (data.status === false) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to fetch post.",
          confirmButtonColor: "#6366f1"
        });
        navigate("/posts");
        return;
      } else if (!data.data || !data.data.post) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Post not found.",
          confirmButtonColor: "#6366f1"
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
          ? toLocalDatetimeLocal(dataPost.scheduled_at)
          : "",
        category: dataPost.category || "",
        tags: dataPost.tags ? dataPost.tags.join(", ") : "",
        image_prompt: dataPost.image_prompt || null,
        image_url: dataPost.image_url || null
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch post.",
        confirmButtonColor: "#6366f1"
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
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please select at least one platform.",
          confirmButtonColor: "#6366f1"
        });
        setIsSaving(false);
        return;
      }

      const updateData = {
        title: formData.title,
        content: formData.content,
        platforms: formData.platforms,
        status: formData.status,
        scheduled_at: formData.scheduled_at || null,
        image_prompt: formData.image_prompt || null,
        image_url: formData.image_url
      };

      await apiService.updatePost(id, updateData);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Post updated successfully!",
        confirmButtonColor: "#6366f1"
      });

      navigate("/posts");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update post.",
        confirmButtonColor: "#6366f1"
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
      <div className=" space-y-8">
        {/* Sticky translucent action bar */}
        <div className="sticky top-0 z-20 -mx-2 px-2 py-3 bg-gradient-to-b from-white/85 to-white/60 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-indigo-50 rounded-b-xl flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/posts")} className="hover:bg-indigo-50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
          {/* This button submits the same form below via its id */}
          <Button
            type="submit"
            form="edit-post-form"
            disabled={isSaving}
            className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-md"
          >
            {isSaving ? "Saving..." : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Card className="rounded-2xl border-indigo-100/70 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Post</CardTitle>
            <CardDescription>Update your post details</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Give the form an id so the top Save button can submit it */}
            <form id="edit-post-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Title + Status (two columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter post title"
                    required
                    className="border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>

              </div>

              {/* Content + Preview image */}
              <div className="space-y-3">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your post content..."
                  className="min-h-[200px] border-gray-300 focus-visible:ring-indigo-500"
                  required
                />
                {formData.image_url && (
                  <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={formData.image_url}
                      alt="Post Image"
                      className="w-auto max-h-72 object-contain "
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/no-image.png";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Platforms */}
              <div className="space-y-2">
                <Label>Select Platforms</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {connectedAccounts.length === 0 ? (
                    <p className="text-muted-foreground">
                      No social accounts connected. Connect from dashboard.
                    </p>
                  ) : (
                    connectedAccounts.map((acc) => {
                      const checked = formData.platforms.includes(acc.platform);
                      return (
                        <label
                          key={acc.id}
                          htmlFor={`pf-${acc.platform}`}
                          className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition ${checked ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                          <Checkbox
                            id={`pf-${acc.platform}`}
                            checked={checked}
                            onCheckedChange={() => handlePlatformToggle(acc.platform)}
                          />
                          <span className="text-sm">
                            {acc.platform} {acc.account_name ? `(${acc.account_name})` : ""}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="border-gray-300 focus-visible:ring-indigo-500">
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
                  <div className="space-y-2 md:col-span-4">
                    <Label htmlFor="scheduled_at">Schedule Date & Time</Label>
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduled_at: e.target.value })
                      }
                      required
                      className="border-gray-300 focus-visible:ring-indigo-500 block"
                      min={new Date().toISOString().slice(0,16)}
                    />
                    {formData.scheduled_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        India Time: {new Date(formData.scheduled_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`space-y-2 ${formData.status === "scheduled" ? "md:col-span-8" : "md:col-span-12"
                    }`}
                >
                  <Label htmlFor="image_prompt">Image Title / Prompt</Label>
                  <Input
                    id="image_prompt"
                    value={formData.image_prompt || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, image_prompt: e.target.value })
                    }
                    placeholder="Optional prompt or title for image"
                    className="border-gray-300 focus-visible:ring-indigo-500"
                    disabled
                  />
                </div>
            
                </div>
              {/* Schedule (conditional) + Image Prompt (2 columns) */}
              


              {/* Image URL (full width) */}
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url || ""}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="border-gray-300 focus-visible:ring-indigo-500"
                  disabled
                />
              </div>

              {/* Bottom actions (kept as requested; top sticky save also submits) */}
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/posts")}
                  className="sm:w-40"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 sm:flex-none sm:w-48 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-md"
                >
                  {isSaving ? "Saving..." : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
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
