import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReusableForm from "@/components/ReusableForm";
import { apiService } from "@/services/api";
import * as Yup from "yup";

const UpdateProfile = () => {
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    user_name: "",
    user_fname: "",
    user_lname: "",
    user_phone: "",
    email: "",
  });
  const [originalData, setOriginalData] = useState<any>(null);

  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiService.getProfile();
      if (res.status) {
        const u = res.data.user;
        const userData = {
          user_name: u.user_name || "",
          user_fname: u.user_fname || "",
          user_lname: u.user_lname || "",
          user_phone: u.user_phone || "",
          email: u.email || "",
        };
        setFormValues(userData);
        setOriginalData(userData);
      }
    } catch (err) {
      Swal.fire("Error", "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  // Profile Fields Configuration
  const profileFields = [
    { name: "user_name", label: "Username", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "user_phone", label: "Phone", type: "text", required: true },
    { name: "user_fname", label: "First Name", type: "text", required: true },
    { name: "user_lname", label: "Last Name", type: "text", required: true },
  ];

  // Profile Validation Schema
  const profileSchema = Yup.object().shape({
    user_name: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    user_phone: Yup.string()
      .matches(/^\d{10}$/, "Phone must be 10 digits")
      .required("Phone is required"),
    user_fname: Yup.string().required("First name is required"),
    user_lname: Yup.string().required("Last name is required"),
  });

  // Password Fields Configuration
  const passwordFields = [
    {
      name: "currentPassword",
      label: "Current Password",
      type: "password",
      required: true,
      placeholder: "Enter current password",
    },
    {
      name: "newPassword",
      label: "New Password",
      type: "password",
      required: true,
      placeholder: "Enter new password",
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      required: true,
      placeholder: "Confirm new password",
    },
  ];

  // Password Validation Schema
  const passwordSchema = Yup.object().shape({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .matches(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase, one uppercase, and one number"
      )
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Confirm password is required"),
  });

  // Profile Submit Handler
  const handleProfileSubmit = async (values: any) => {
    const noChanges =
      originalData &&
      Object.keys(values).every((key) => originalData[key] === values[key]);

    if (noChanges) {
      return Swal.fire("No Changes", "You didn't change anything.", "info");
    }

    const confirm = await Swal.fire({
      icon: "warning",
      title: "Update Profile?",
      text: "Are you sure?",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const res = await apiService.updateProfile(values);
      if (res.status) {
        Swal.fire("Success", "Profile updated successfully", "success");
        setOriginalData(values);
        setFormValues(values);
      } else {
        Swal.fire("Error", res?.message || "Something went wrong", "error");
      }
    } catch (err: any) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Something went wrong",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Password Submit Handler
  const handlePasswordSubmit = async (values: any) => {
    const payload = {
      old_password: values.currentPassword,
      new_password: values.newPassword,
      confirm_password: values.confirmPassword,
    };

    setLoading(true);
    try {
      const res = await apiService.changePassword(payload);
      if (res.status) {
        Swal.fire("Success", "Password changed successfully", "success");
        setPassForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const backendErrors =
          res?.errors?.map((e: any) => e.msg).join(", ") || res?.message;
        Swal.fire("Error", backendErrors || "Something went wrong", "error");
      }
    } catch (err: any) {
      const serverData = err?.response?.data;
      const errMsg =
        (serverData?.errors &&
          serverData.errors.map((e: any) => e.msg).join(", ")) ||
        serverData?.message ||
        err?.message ||
        "Something went wrong";
      Swal.fire("Error", errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        <h2 className="flex items-baseline gap-2 text-3xl font-extrabold">
          <span className="flex bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">
            Update
          </span>
          Profile
        </h2>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="bg-indigo-50/50 p-1 rounded-xl">
            <TabsTrigger
              value="info"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 py-2"
            >
              Personal Information
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 py-2"
            >
              Change Password
            </TabsTrigger>
          </TabsList>

          {/* PERSONAL INFORMATION */}
          <TabsContent value="info">
            <Card className="border border-indigo-100/70 shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-indigo-700 font-semibold">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReusableForm
                  initialValues={formValues}
                  validationSchema={profileSchema}
                  fields={profileFields}
                  onSubmit={handleProfileSubmit}
                  SubmitBtn="Save Changes"
                  loading={loading}
                  enableReinitialize={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* CHANGE PASSWORD */}
          <TabsContent value="password">
            <Card className="border border-indigo-100/70 shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-indigo-700 font-semibold">
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReusableForm
                  initialValues={passForm}
                  validationSchema={passwordSchema}
                  fields={passwordFields}
                  onSubmit={handlePasswordSubmit}
                  SubmitBtn="Change Password"
                  loading={loading}
                  enableReinitialize={false}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UpdateProfile;
