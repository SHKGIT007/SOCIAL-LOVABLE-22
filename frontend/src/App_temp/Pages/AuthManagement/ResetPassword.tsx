import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Swal from "sweetalert2";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { apiService } from "@/services/api";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const state = location.state as any;
    if (state?.email && state?.otp) {
      setEmail(state.email);
      setOtp(state.otp);
    } else {
      navigate("/forgot-password");
    }
  }, [location, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔹 Empty check
    if (!newPassword || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter both passwords.",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    // 🔹 Match check
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords Do Not Match",
        text: "Both passwords must be the same.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    // 🔹 Strength check (sync with backend)
    if (!passwordRegex.test(newPassword)) {
      Swal.fire({
        icon: "error",
        title: "Weak Password",
        text: "Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 6 characters long.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.resetPassword({
        email,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response?.status) {
        Swal.fire({
          icon: "success",
          title: "Password Reset Successful",
          text: "You can now log in using your new password.",
          confirmButtonColor: "#6366f1",
        }).then(() => navigate("/auth"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Reset Failed",
          text: response?.message || "Failed to reset password",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error: any) {
      const apiError = error?.response?.data;

      let errorMessage = "Failed to reset password";

      // 🔥 express-validator error handling
      if (apiError?.errors && Array.isArray(apiError.errors)) {
        errorMessage = apiError.errors[0]?.msg;
      } else if (apiError?.message) {
        errorMessage = apiError.message;
      }

      Swal.fire({
        icon: "error",
        title: "Password Reset Failed",
        text: errorMessage,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4">
      <div className="w-full max-w-md">
        <Card className="border-indigo-100 shadow-xl rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-extrabold">
              <span className="bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">
                Reset Password
              </span>
            </CardTitle>
            <CardDescription>Create a strong new password</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label>New Password*</Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Must contain uppercase, lowercase & number (min 6 chars)
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label>Confirm Password*</Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-sky-500 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
