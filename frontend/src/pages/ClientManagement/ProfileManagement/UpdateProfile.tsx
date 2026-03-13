import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReusableForm from "@/components/ReusableForm";
import { apiService } from "@/services/api";
import { logout } from "@/utils/auth";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { User, Shield, Key, AlertTriangle, Trash2, ArrowLeft } from "lucide-react";

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
  const [memberSince, setMemberSince] = useState("");
  const navigate = useNavigate();
  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
        if (u.created_at) {
          setMemberSince(new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
        }
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
      type: "passwordWithToggle",
      show: showCurrent,
      onToggle: () => setShowCurrent(!showCurrent),
      required: true,
      placeholder: "Enter current password",
    },
    {
      name: "newPassword",
      label: "New Password",
      type: "passwordWithToggle",
      show: showNew,
      onToggle: () => setShowNew(!showNew),
      required: true,
      placeholder: "Enter new password",
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "passwordWithToggle",
      show: showConfirm,
      onToggle: () => setShowConfirm(!showConfirm),
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
      text: "Are you sure you want to save these changes?",
      showCancelButton: true,
      confirmButtonText: "Yes, Update",
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#94a3b8",
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const res = await apiService.updateProfile(values);
      if (res.status) {
        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text: "Your profile information has been saved successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
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
        Swal.fire({
          icon: "success",
          title: "Password Changed",
          text: "Your security credentials have been updated.",
          timer: 2000,
          showConfirmButton: false,
        });
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

  const handleDeleteAccount = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete your account? This action is permanent and cannot be undone. All your data will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Delete My Account",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const res = await apiService.deleteMyAccount();
          if (res.status) {
            Swal.fire({
              title: "Account Deleted",
              text: "Your account has been permanently deleted.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
            setTimeout(() => {
              logout();
              navigate("/auth");
            }, 1500);
          } else {
            Swal.fire("Error", res.message || "Failed to delete account", "error");
          }
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: "Something went wrong while deleting your account.",
            icon: "error",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header Section */}
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
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <span className={`text-transparent bg-clip-text ${primaryGradientClass}`}>
                Profile
              </span>
            </h1>
            <p className="text-gray-500 mt-1">Manage your account information and security settings</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-indigo-50 transition shadow-sm"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
            {/* Quick Info Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border border-indigo-100 shadow-sm overflow-hidden rounded-2xl">
                <div className={`h-24 ${primaryGradientClass}`} />
                <CardContent className="relative pt-0">
                  <div className="flex flex-col items-center -mt-12 mb-4">
                    <div className="h-24 w-24 rounded-full bg-white p-1 border-4 border-white shadow-xl">
                      <div className="h-full w-full rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <User size={48} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mt-4 text-gray-900">
                      {originalData?.user_fname} {originalData?.user_lname}
                    </h3>
                    <p className="text-sm text-indigo-600 font-medium">@{originalData?.user_name}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Shield className="h-4 w-4 text-indigo-500" />
                        <span>Member Since</span>
                      </div>
                      <span className="font-semibold text-gray-700">{memberSince || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Shield className="h-4 w-4 text-emerald-500" />
                        <span>Account Status</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Verified</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-100 bg-red-50/20 shadow-sm rounded-2xl overflow-hidden border">
                <CardHeader className="pb-3 flex flex-row items-center gap-2 text-red-700 border-b border-red-100/30">
                  <AlertTriangle className="h-5 w-5" />
                  <CardTitle className="text-base font-bold">Privacy & Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Once you close your account, there is no going back. All your cloud data and active subscriptions will be purged immediately.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full bg-red-600 hover:bg-red-700 font-bold py-5 rounded-xl shadow-lg shadow-red-100 transition-all hover:scale-[1.02]"
                    onClick={handleDeleteAccount}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Close My Account
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="bg-white border border-indigo-100 p-1 rounded-2xl mb-6 shadow-sm flex w-full">
                  <TabsTrigger
                    value="info"
                    className="flex-1 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl py-3 flex items-center gap-2 transition-all"
                  >
                    <User size={16} />
                    Account Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="flex-1 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl py-3 flex items-center gap-2 transition-all"
                  >
                    <Key size={16} />
                    Access Control
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-0 focus-visible:outline-none">
                  <Card className="border border-indigo-100 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-8 py-6">
                      <CardTitle className="text-gray-800 font-bold">Personal Profile</CardTitle>
                      <CardDescription>Keep your contact information up to date for official communication</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      <ReusableForm
                        initialValues={formValues}
                        validationSchema={profileSchema}
                        fields={profileFields}
                        onSubmit={handleProfileSubmit}
                        SubmitBtn="Update Info"
                        loading={loading}
                        enableReinitialize={true}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="password" className="mt-0 focus-visible:outline-none">
                  <Card className="border border-indigo-100 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-8 py-6">
                      <CardTitle className="text-gray-800 font-bold">Security & Login</CardTitle>
                      <CardDescription>Update your access credentials to keep your account secure</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UpdateProfile;
