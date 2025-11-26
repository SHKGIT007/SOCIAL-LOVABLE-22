import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";

const UpdateProfile = () => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    user_name: "",
    user_fname: "",
    user_lname: "",
    user_phone: "",
    email: "",
  });

  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiService.getProfile();
      if (res.status === true) {
        const u = res.data.user;

        const userData = {
          user_name: u.user_name || "",
          user_fname: u.user_fname || "",
          user_lname: u.user_lname || "",
          user_phone: u.user_phone || "",
          email: u.email || "",
        };

        setForm(userData);
        setOriginalData(userData);
      }
    } catch (err) {
      Swal.fire("Error", "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    let { name, value } = e.target;

    if (name === "user_fname" || name === "user_lname")
      value = value.replace(/[^A-Za-z]/g, "");
    if (name === "user_phone")
      value = value.replace(/[^0-9]/g, "").slice(0, 10);

    setForm({ ...form, [name]: value });
  };

  const handlePasswordChange = (e: any) => {
    const { name, value } = e.target;
    setPassForm({ ...passForm, [name]: value });
  };

  const handleUpdate = async () => {
    if (form.user_phone.length !== 10)
      return Swal.fire("Invalid Phone", "Phone must be 10 digits", "error");

    if (!form.email.includes("@") || !form.email.includes(".")) {
      return Swal.fire("Invalid Email", "Enter valid email", "error");
    }

    const noChanges =
      originalData &&
      originalData.user_name === form.user_name &&
      originalData.user_fname === form.user_fname &&
      originalData.user_lname === form.user_lname &&
      originalData.user_phone === form.user_phone &&
      originalData.email === form.email;

    if (noChanges)
      return Swal.fire("No Changes", "You didn’t change anything.", "info");

    const confirm = await Swal.fire({
      icon: "warning",
      title: "Update Profile?",
      text: "Are you sure?",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiService.updateProfile(form);

      if (res.status === true) {
        Swal.fire("Success", "Profile updated successfully", "success");
      } else {
        const backendError =
          res?.errors?.[0]?.msg || res?.message || "Something went wrong";

        Swal.fire("Error", backendError, "error");
      }
    } catch (err: any) {
      const backendError =
        err?.response?.data?.errors?.[0]?.msg ||
        err?.response?.data?.message ||
        "Something went wrong";

      Swal.fire("Error", backendError, "error");
    }
  };
  const handlePasswordSubmit = async () => {
    // basic client-side checks
    const old = passForm.currentPassword.trim();
    const nw = passForm.newPassword;
    const confirm = passForm.confirmPassword;

    if (!old || !nw || !confirm) {
      return Swal.fire("Error", "All fields are required", "error");
    }

    if (nw !== confirm) {
      return Swal.fire(
        "Mismatch",
        "New password & confirm password must match",
        "error"
      );
    }

    if (nw.length < 6) {
      return Swal.fire(
        "Weak Password",
        "New password must be at least 6 characters long",
        "error"
      );
    }

    // same regex used by backend validator: at least one lowercase, one uppercase and one number
    const pwdRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!pwdRegex.test(nw)) {
      return Swal.fire(
        "Weak Password",
        "New password must contain at least one lowercase letter, one uppercase letter, and one number",
        "error"
      );
    }

    // map camelCase -> snake_case to match backend expectations
    const payload = {
      old_password: old,
      new_password: nw,
      confirm_password: confirm,
    };

    try {
      const res = await apiService.changePassword(payload);

      // backend success format: { status: true, ... }
      if (res && res.status === true) {
        Swal.fire("Success", "Password changed successfully", "success");
        setPassForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        return;
      }

      // handle backend validation errors (array) or message
      const backendErrors =
        res?.errors?.map((e: any) => e.msg).join(", ") || res?.message;

      Swal.fire("Error", backendErrors || "Something went wrong", "error");
    } catch (err: any) {
      // robust error extraction from axios/fetch style response
      const serverData = err?.response?.data;
      const errMsg =
        (serverData?.errors &&
          serverData.errors.map((e: any) => e.msg).join(", ")) ||
        serverData?.message ||
        err?.message ||
        "Something went wrong";

      Swal.fire("Error", errMsg, "error");
    }
  };

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Gradient Title */}
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">
          Update Profile
        </h1>

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

          {/* PERSONAL INFORMATION TAB */}
          <TabsContent value="info">
            <Card className="border border-indigo-100/70 shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-indigo-700 font-semibold">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Username */}
                <div className="space-y-1">
                  <Label>Username</Label>
                  <Input
                    name="user_name"
                    value={form.user_name}
                    onChange={handleChange}
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input
                    name="user_phone"
                    value={form.user_phone}
                    onChange={handleChange}
                  />
                </div>

                {/* First + Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>First Name</Label>
                    <Input
                      name="user_fname"
                      value={form.user_fname}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Last Name</Label>
                    <Input
                      name="user_lname"
                      value={form.user_lname}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleUpdate}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CHANGE PASSWORD TAB */}
          <TabsContent value="password">
            <Card className="border border-indigo-100/70 shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-indigo-700 font-semibold">
                  Change Password
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Current Password */}
                <div className="space-y-1">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword.current ? "text" : "password"}
                      name="currentPassword"
                      value={passForm.currentPassword}
                      onChange={handlePasswordChange}
                    />
                    <span
                      className="absolute right-3 top-3 cursor-pointer"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          current: !showPassword.current,
                        })
                      }
                    >
                      {showPassword.current ? <EyeOff /> : <Eye />}
                    </span>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword.new ? "text" : "password"}
                      name="newPassword"
                      value={passForm.newPassword}
                      onChange={handlePasswordChange}
                    />
                    <span
                      className="absolute right-3 top-3 cursor-pointer"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          new: !showPassword.new,
                        })
                      }
                    >
                      {showPassword.new ? <EyeOff /> : <Eye />}
                    </span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passForm.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                    <span
                      className="absolute right-3 top-3 cursor-pointer"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          confirm: !showPassword.confirm,
                        })
                      }
                    >
                      {showPassword.confirm ? <EyeOff /> : <Eye />}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={handlePasswordSubmit}
                  >
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UpdateProfile;
