import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import * as Yup from "yup";
import ReusableForm from "@/components/ReusableForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SystemSettings = () => {
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    type: "",
    api_url: "",
    api_key: "",
    is_active: false,
    cloudinary_cloud_name: "",
    cloudinary_api_key: "",
    cloudinary_api_secret: "",
    google_client_id: "",
    google_client_secret: "",
  });

  const originalValuesRef = useRef(initialValues);

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await apiService.getSystemSettings();
        if (res.status && Array.isArray(res.data) && res.data.length > 0) {
          const s = res.data[0];
          const values = {
            type: s.type || "",
            api_url: s.api_url || "",
            api_key: s.api_key || "",
            is_active: Boolean(s.is_active),
            cloudinary_cloud_name: s.cloudinary_cloud_name || "",
            cloudinary_api_key: s.cloudinary_api_key || "",
            cloudinary_api_secret: s.cloudinary_api_secret || "",
            google_client_id: s.google_client_id || "",
            google_client_secret: s.google_client_secret || "",
          };
          setInitialValues(values);
          originalValuesRef.current = values;
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to fetch settings",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const validationSchema = Yup.object({
    type: Yup.string().required("AI Provider type is required"),
    api_url: Yup.string().required("API URL is required"),
    api_key: Yup.string().required("API Key is required"),
  });

  const fields = [
    {
      name: "type",
      label: "AI Provider",
      type: "select",
      options: [
        { label: "Select AI Provider Type", value: "" },
        { label: "Groq", value: "groq" },
        { label: "OpenAI", value: "openai" },
        { label: "Anyscale", value: "anyscale" },
        { label: "Other", value: "other" },
      ],
      required: true,
    },
    {
      name: "api_url",
      label: "API URL",
      placeholder: "Enter API URL",
      required: true,
    },
    {
      name: "api_key",
      label: "API Key",
      placeholder: "Enter API Key",
      required: true,
    },
    // { name: "is_active", label: "Active", type: "switch" },
    {
      name: "cloudinary_cloud_name",
      label: "Cloudinary Cloud Name",
      placeholder: "Enter Cloud Name",
    },
    {
      name: "cloudinary_api_key",
      label: "Cloudinary API Key",
      placeholder: "Enter API Key",
    },
    {
      name: "cloudinary_api_secret",
      label: "Cloudinary API Secret",
      placeholder: "Enter API Secret",
    },
    {
      name: "google_client_id",
      label: "Google Client ID",
      placeholder: "Enter Client ID",
    },
    {
      name: "google_client_secret",
      label: "Google Client Secret",
      placeholder: "Enter Client Secret",
    },
  ];

  const onSubmit = async (values: any) => {
    // Check if changes were made
    const changesMade = Object.keys(values).some(
      (key) => values[key] !== originalValuesRef.current[key]
    );
    if (!changesMade) {
      Swal.fire({
        icon: "info",
        title: "No changes",
        text: "No changes were made.",
      });
      return;
    }

    // Confirmation
    const confirm = await Swal.fire({
      icon: "question",
      title: "Confirm Update",
      text: "Are you sure you want to update the system settings?",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const updateData = { settings: values };
      const res = await apiService.updateSystemSettings(updateData);
      if (res.status) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Settings updated successfully",
        });
        originalValuesRef.current = values; // Update reference after success
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.message || "Failed to update settings",
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update settings",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-gray-100">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            <span
              className={`text-transparent bg-clip-text ${primaryGradientClass}`}
            >
              System
            </span>{" "}
            Settings
          </h1>
          <p className="text-lg text-gray-600">
            Manage all your system-wide settings from here.
          </p>
        </div>

        {/* Card with form */}
        <Card className="shadow-lg border-2 border-indigo-100/50 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-indigo-600">
              Update Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReusableForm
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
              fields={fields}
              loading={loading}
              SubmitBtn="Update Settings"
              enableReinitialize
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettings;
