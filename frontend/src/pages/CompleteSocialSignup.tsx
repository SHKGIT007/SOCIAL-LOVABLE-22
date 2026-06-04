import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { apiService } from "@/services/api";
import { setAuthData } from "@/utils/auth";

const CompleteSocialSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [socialToken, setSocialToken] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const token = searchParams.get("social_token");
    const emailParam = searchParams.get("email");


    if (!token || !emailParam) {
      Swal.fire({
        icon: "error",
        title: "Invalid Link",
        text: "Social token or email missing. Please sign up again.",
      }).then(() => navigate("/auth"));
    } else {
      setSocialToken(token);
      setEmail(emailParam);
    }
  }, [searchParams, navigate]);

  const handleCompleteSignup = async () => {

    if (!userPassword || !confirmPassword) {
      Swal.fire("Error", "Please enter password", "error");
      return;
    }

    if (userPassword.length < 6) {
      Swal.fire("Error", "Password must be at least 6 characters", "error");
      return;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(userPassword)) {
      Swal.fire("Error", "Password must contain at least one uppercase letter", "error");
      return;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(userPassword)) {
      Swal.fire("Error", "Password must contain at least one lowercase letter", "error");
      return;
    }

    // Check for number
    if (!/\d/.test(userPassword)) {
      Swal.fire("Error", "Password must contain at least one number", "error");
      return;
    }

    if (userPassword !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.post("/auth/complete-social-signup", {
        token: socialToken,
        email: email,
        password: userPassword,
      });


      if (response.status) {
        // Set auth data
        setAuthData({
          token: response.data.token,
          user: response.data.user,
        });

        Swal.fire({
          icon: "success",
          title: "Account Created!",
          text: "Your account has been created successfully.",
          didClose: () => {
            // Redirect to dashboard
            navigate("/dashboard", { replace: true });
          },
        });
      } else {
        Swal.fire("Error", response.message || "Failed to complete signup", "error");
      }
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to complete signup",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white">
          <CardTitle>Complete Your Signup</CardTitle>
          <CardDescription className="text-indigo-100">
            Set a password for your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Email Display */}
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="p-3 bg-gray-100 rounded-lg text-gray-700 font-medium">
              {email}
            </div>
            <p className="text-xs text-gray-500">
              This email is verified and cannot be changed
            </p>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Create Password*</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter a strong password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                disabled={isLoading}
                className="border-gray-300 focus-visible:ring-indigo-500 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Password must have: 6+ characters, 1 uppercase, 1 lowercase, 1 number
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password*</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="border-gray-300 focus-visible:ring-indigo-500 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirm(!showConfirm)}
                disabled={isLoading}
              >
                {showConfirm ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleCompleteSignup}
            disabled={
              isLoading ||
              !userPassword ||
              !confirmPassword ||
              userPassword !== confirmPassword
            }
            className="w-full h-10 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing Signup...
              </>
            ) : (
              "Complete Signup"
            )}
          </Button>

          {/* Help Text */}
          <p className="text-center text-xs text-gray-500">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/auth")}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteSocialSignup;
