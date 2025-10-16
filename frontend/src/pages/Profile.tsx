import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import DashboardLayout from "@/components/Layout/DashboardLayout";

const initialProfile = {
  business_name: "",
  description: "",
  platforms: "",
  brand_voice: "",
  hashtags: "",
  image_style: "",
};

import { useEffect } from "react";

const Profile = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await apiService.request("/profile");
        if (res.status && res.data?.profile) {
          setProfile({
            business_name: res.data.profile.business_name || "",
            description: res.data.profile.description || "",
            platforms: res.data.profile.platforms || "",
            brand_voice: res.data.profile.brand_voice || "",
            hashtags: res.data.profile.hashtags || "",
            image_style: res.data.profile.image_style || "",
          });
        }
      } catch (error) {
        // ignore if not found
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend validation for required fields
    if (!profile.business_name.trim()) {
      toast({ title: "Error", description: "Business/Creator Name is required.", variant: "destructive" });
      return;
    }
    if (!profile.description.trim()) {
      toast({ title: "Error", description: "Description is required.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiService.saveProfile(profile);
      if (res.status) {
        toast({ title: "Profile Saved", description: "Your profile details have been updated." });
      } else {
        toast({ title: "Error", description: res.message || "Failed to save profile.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save profile.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="client">
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
                {/* Each field: label left, input right */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <label htmlFor="business_name" className="w-full md:w-1/3 text-base font-semibold text-gray-700 md:text-right">Business/Creator Name *</label>
                  <Input id="business_name" name="business_name" placeholder="Business/Creator Name" value={profile.business_name} onChange={handleChange} required className="w-full md:w-2/3 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <label htmlFor="description" className="w-full md:w-1/3 text-base font-semibold text-gray-700 md:text-right">Description *</label>
                  <Input id="description" name="description" placeholder="Description" value={profile.description} onChange={handleChange} required className="w-full md:w-2/3 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <label htmlFor="platforms" className="w-full md:w-1/3 text-base font-semibold text-gray-700 md:text-right">Preferred Platforms</label>
                  <Input id="platforms" name="platforms" placeholder="Preferred Platforms (comma separated)" value={profile.platforms} onChange={handleChange} className="w-full md:w-2/3 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <label htmlFor="brand_voice" className="w-full md:w-1/3 text-base font-semibold text-gray-700 md:text-right">Brand Voice</label>
                  <Input id="brand_voice" name="brand_voice" placeholder="Brand Voice (e.g. friendly, professional)" value={profile.brand_voice} onChange={handleChange} className="w-full md:w-2/3 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <label htmlFor="hashtags" className="w-full md:w-1/3 text-base font-semibold text-gray-700 md:text-right">Default Hashtags</label>
                  <Input id="hashtags" name="hashtags" placeholder="Default Hashtags (comma separated)" value={profile.hashtags} onChange={handleChange} className="w-full md:w-2/3 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <label htmlFor="image_style" className="w-full md:w-1/3 text-base font-semibold text-gray-700 md:text-right">Image Style</label>
                  <Input id="image_style" name="image_style" placeholder="Image Style (e.g. minimal, vibrant)" value={profile.image_style} onChange={handleChange} className="w-full md:w-2/3 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md" />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full mt-6 text-lg font-bold py-3 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
