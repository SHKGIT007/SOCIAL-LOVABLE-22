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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input name="business_name" placeholder="Business/Creator Name" value={profile.business_name} onChange={handleChange} required />
              <Input name="description" placeholder="Description" value={profile.description} onChange={handleChange} required />
              <Input name="platforms" placeholder="Preferred Platforms (comma separated)" value={profile.platforms} onChange={handleChange} />
              <Input name="brand_voice" placeholder="Brand Voice (e.g. friendly, professional)" value={profile.brand_voice} onChange={handleChange} />
              <Input name="hashtags" placeholder="Default Hashtags (comma separated)" value={profile.hashtags} onChange={handleChange} />
              <Input name="image_style" placeholder="Image Style (e.g. minimal, vibrant)" value={profile.image_style} onChange={handleChange} />
              <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? "Saving..." : "Save Profile"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
