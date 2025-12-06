import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";
import { Loader2, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { apiService } from "@/services/api";

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
    // Get email and otp from navigation state
    const state = location.state as any;
    if (state?.email && state?.otp) {
      setEmail(state.email);
      setOtp(state.otp);
    } else {
      // If no email/otp in state, redirect to forgot password
      navigate("/forgot-password");
    }
  }, [location, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Fields Required",
        text: "Please enter both password fields",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    if (newPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password Too Short",
        text: "Password must be at least 6 characters long",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords Don't Match",
        text: "New password and confirm password must match",
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

      if (response.status) {
        Swal.fire({
          icon: "success",
          title: "Password Reset",
          text: "Your password has been successfully reset. You can now login with your new password.",
          confirmButtonColor: "#6366f1",
        }).then(() => {
          navigate("/auth");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to reset password",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reset password";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/verify-otp")}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <Card className="shadow-lg border-2 border-indigo-100/50">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Reset Password
            </CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password*</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-gray-300 focus-visible:ring-indigo-500 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Minimum 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password*</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-gray-300 focus-visible:ring-indigo-500 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 flex-1 rounded ${
                        newPassword.length >= 8
                          ? "bg-green-500"
                          : newPassword.length >= 6
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {newPassword.length >= 8 ? "✓ Strong" : newPassword.length >= 6 ? "⚠ Fair" : "✗ Weak"}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-md mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
