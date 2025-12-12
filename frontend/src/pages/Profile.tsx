import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import Swal from "sweetalert2";
import * as Yup from "yup";
import ReusableForm from "@/components/ReusableForm";
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

const profileSchema = Yup.object().shape({
  business_name: Yup.string().required("Business/Creator Name is required"),
  description: Yup.string().required("Description is required"),
});

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
          setOriginalProfile(fetched);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (values) => {
    // Check if profile has changed
    if (JSON.stringify(values) === JSON.stringify(originalProfile)) {
      Swal.fire({
        icon: "info",
        title: "No Changes",
        text: "You haven't made any changes to save.",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    // Confirmation dialog
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

    setIsLoading(true);
    try {
      const res = await apiService.saveProfile(values);
      if (res.status) {
        setOriginalProfile(values);
        setProfile(values);
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

  const fields = [
    {
      name: "business_name",
      label: "Business/Creator Name",
      type: "text",
      placeholder: "Your business or creator name",
      required: true,
    },
    {
      name: "platforms",
      label: "Preferred Platforms",
      type: "text",
      placeholder: "Facebook, Instagram, X (Twitter)",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Describe your brand or services",
      required: true,
    },
    {
      name: "image_style",
      label: "Image Prompt",
      type: "textarea",
      placeholder: "Enter preferred image style or title",
    },
    {
      name: "brand_voice",
      label: "Brand Voice",
      type: "text",
      placeholder: "Friendly, Bold, Professional...",
    },
    {
      name: "hashtags",
      label: "Default Hashtags",
      type: "text",
      placeholder: "#marketing, #socialmedia",
    },
    {
      name: "festival",
      label: "Current Festival/Event",
      type: "text",
      placeholder: "e.g. Diwali, Christmas, Eid",
    },
  ];

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-8">
        <div>
          <h1 className="flex items-baseline gap-2 text-3xl font-extrabold">
            <span className="bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">
              Post
            </span>
            <span className="text-gray-900"> Setting</span>
          </h1>
          <p className="text-muted-foreground">
            Define your brand's personality and preferences for AI-generated
            posts.
          </p>
        </div>

        <ReusableForm
          initialValues={profile}
          validationSchema={profileSchema}
          onSubmit={handleSubmit}
          fields={fields}
          SubmitBtn="Save Profile"
          enableReinitialize={true}
          loading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default Profile;
