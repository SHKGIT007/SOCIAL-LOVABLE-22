import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { apiService } from "@/services/api";
import Swal from "sweetalert2";
import { Loader2, Eye, EyeOff } from "lucide-react";

const CreateUser = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    user_name: "",
    user_fname: "",
    user_lname: "",
    email: "",
    password: "",
    confirm_password: "",
    user_phone: "",
    user_type: "client",
  });

  const handleChange = (e: any) => {
    let { name, value } = e.target;

    // Allow only alphabets in first & last name
    if (name === "user_fname" || name === "user_lname") {
      value = value.replace(/[^A-Za-z]/g, "");
    }

    // Allow only digits, max 10 digits for phone
    if (name === "user_phone") {
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (isLoading) return;

    // Password Match Validation
    if (formData.password !== formData.confirm_password) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Password and Confirm Password must match!",
      });
      return;
    }

    // Phone number validation
    if (formData.user_phone.length !== 10) {
      Swal.fire({
        icon: "error",
        title: "Invalid Phone",
        text: "Phone number must be exactly 10 digits!",
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "Do you want to create this user?",
      showCancelButton: true,
      confirmButtonText: "Yes, Create",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    setIsLoading(true);

    try {
      const { confirm_password, ...submitData } = formData;

      const response = await apiService.createUser(submitData);

      if (response?.status) {
        Swal.fire({
          icon: "success",
          title: "User Created",
          text: "User has been created successfully!",
          timer: 1500,
          showConfirmButton: false,
        });

        setTimeout(() => navigate("/admin/users"), 1500);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response?.message || "Unable to create user",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Something went wrong while creating user",
      });
    }

    setIsLoading(false);
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-3xl mx-auto mt-10">
        <Card className="shadow-lg border-indigo-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Create New User
            </CardTitle>
            <CardDescription>
              Fill the details below to create a new user
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>First Name*</Label>
                  <Input
                    name="user_fname"
                    value={formData.user_fname}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Last Name*</Label>
                  <Input
                    name="user_lname"
                    value={formData.user_lname}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Phone*</Label>
                  <Input
                    name="user_phone"
                    value={formData.user_phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Email*</Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Username*</Label>
                  <Input
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Password*</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pr-10"
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <Label>Confirm Password*</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    className="pr-10"
                  />

                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateUser;
