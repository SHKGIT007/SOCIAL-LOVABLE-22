import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";

const initialProfile = {
  business_name: "",
  description: "",
  platforms: "",
  brand_voice: "",
  hashtags: "",
  image_style: "",
  festival: "",
};

const Profile = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(initialProfile);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await apiService.request("/profile");
        if (res.status && res.data?.profile) {
          const fetched = {
            business_name: res.data.profile.business_name || "",
            description: res.data.profile.description || "",
            platforms: res.data.profile.platforms || "",
            brand_voice: res.data.profile.brand_voice || "",
            hashtags: res.data.profile.hashtags || "",
            image_style: res.data.profile.image_style || "",
            festival: res.data.profile.festival || "",
          };

          setProfile(fetched);
          setOriginalProfile(fetched); // <-- important
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const isProfileChanged = () => {
    return JSON.stringify(profile) !== JSON.stringify(originalProfile);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required field validation
    if (!profile.business_name.trim() || !profile.description.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill all required fields.",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    // If no changes made
    if (!isProfileChanged()) {
      Swal.fire({
        icon: "info",
        title: "No Changes",
        text: "You haven't made any changes to save.",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    // Confirm before saving
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Save Changes?",
      text: "Are you sure you want to save the updated profile?",
      showCancelButton: true,
      confirmButtonText: "Yes, Save",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#6366f1",
    });

    if (!confirm.isConfirmed) return;

    // Save API
    setIsLoading(true);

    try {
      const res = await apiService.saveProfile(profile);

      if (res.status) {
        setOriginalProfile(profile); // update original reference

        Swal.fire({
          icon: "success",
          title: "Profile Saved",
          text: "Your profile details have been updated.",
          confirmButtonColor: "#6366f1",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.message || "Failed to save profile.",
          confirmButtonColor: "#6366f1",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save profile.",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="flex items-baseline gap-2 text-3xl font-extrabold">
            <span className="bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">
              Profile
            </span>
            <span className="text-gray-900"> Settings</span>
          </h1>
          <p className="text-muted-foreground">
            Define your brand’s personality and preferences for AI-generated
            posts.
          </p>
        </div>

        <Card className="border-indigo-100 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-gray-800 text-lg font-semibold">
              Brand & Content Profile
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 2-column layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Row 1 */}
                <div className="flex flex-col space-y-1">
                  <label
                    htmlFor="business_name"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Business/Creator Name *
                  </label>
                  <Input
                    id="business_name"
                    name="business_name"
                    placeholder="Your business or creator name"
                    value={profile.business_name}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label
                    htmlFor="platforms"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Preferred Platforms
                  </label>
                  <Input
                    id="platforms"
                    name="platforms"
                    placeholder="Facebook, Instagram, X (Twitter)"
                    value={profile.platforms}
                    onChange={handleChange}
                    className="border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>

                {/* Row 2 — Description + Image Title */}
                <div className="flex flex-col space-y-1">
                  <label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Description *
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your brand or services"
                    value={profile.description}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus-visible:ring-indigo-500 min-h-[100px]"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label
                    htmlFor="image_style"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Image Prompt
                  </label>
                  <Textarea
                    id="image_style"
                    name="image_style"
                    placeholder="Enter preferred image style or title"
                    value={profile.image_style}
                    onChange={handleChange}
                    className="border-gray-300 focus-visible:ring-indigo-500 min-h-[100px]"
                  />
                </div>

                {/* Row 3 */}
                <div className="flex flex-col space-y-1">
                  <label
                    htmlFor="brand_voice"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Brand Voice
                  </label>
                  <Input
                    id="brand_voice"
                    name="brand_voice"
                    placeholder="Friendly, Bold, Professional..."
                    value={profile.brand_voice}
                    onChange={handleChange}
                    className="border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label
                    htmlFor="hashtags"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Default Hashtags
                  </label>
                  <Input
                    id="hashtags"
                    name="hashtags"
                    placeholder="#marketing, #socialmedia"
                    value={profile.hashtags}
                    onChange={handleChange}
                    className="border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>

                {/* Row 4 */}
                <div className="flex flex-col space-y-1 md:col-span-2">
                  <label
                    htmlFor="festival"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Current Festival/Event
                  </label>
                  <Input
                    id="festival"
                    name="festival"
                    placeholder="e.g. Diwali, Christmas, Eid"
                    value={profile.festival}
                    onChange={handleChange}
                    className="border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto px-10 py-2.5 text-base font-semibold bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white rounded-md shadow-md"
                >
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
