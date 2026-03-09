import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import Swal from "sweetalert2";
import * as Yup from "yup";
import ReusableForm from "@/components/ReusableForm";
import { apiService } from "@/services/api";
import { useNavigate } from "react-router-dom";

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
  platforms: Yup.string().required("Preferred Platforms is required"),
  brand_voice: Yup.string().required("Brand Voice is required"),
  hashtags: Yup.string().required("Default Hashtags are required"),
  image_style: Yup.string().required("Image Prompt is required"),
  festival: Yup.string().required("Current Festival/Event is required"),
});

const Profile = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(initialProfile);
  const navigate = useNavigate();
  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

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
      type: "select",
      placeholder: "Select platform",
      required: true,
      options: [
        { label: "Facebook", value: "facebook" },
        { label: "Instagram", value: "instagram" },
        { label: "X (Twitter)", value: "twitter" },
        { label: "LinkedIn", value: "linkedin" },
        { label: "YouTube", value: "youtube" },
      ],
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
      required: true,
    },
    {
      name: "brand_voice",
      label: "Brand Voice",
      type: "text",
      placeholder: "Friendly, Bold, Professional...",
      required: true,
    },
    {
      name: "hashtags",
      label: "Default Hashtags",
      type: "text",
      placeholder: "#marketing, #socialmedia",
      required: true,
    },
    {
      name: "festival",
      label: "Current Festival/Event",
      type: "text",
      placeholder: "e.g. Diwali, Christmas, Eid",
      required: true,
    },
  ];

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-8">
        <div
          className="
    sticky top-0 z-10
    -mx-2 px-4 py-4
    bg-gradient-to-b from-white/90 to-white/70
    backdrop-blur
    border-b border-indigo-100
    flex flex-col sm:flex-row sm:items-center sm:justify-between
    gap-4
  "
        >
          <div>
            <h1 className="text-3xl font-extrabold">
              <span
                className={`text-transparent bg-clip-text ${primaryGradientClass}`}
              >
                Post
              </span>{" "}
              Settings
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              View and manage post setting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-indigo-50 transition"
            >
              ← Back
            </button>
          </div>
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
