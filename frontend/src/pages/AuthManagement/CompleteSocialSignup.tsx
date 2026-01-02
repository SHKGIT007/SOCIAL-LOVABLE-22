import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import { setAuthData } from "@/utils/auth";

const CompleteSocialSignup = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [socialToken, setSocialToken] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Enable submit only if passwords are valid
  const isSubmitDisabled = password.length < 6 || password !== confirm;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("social_token") || params.get("token"); // handle both cases
    const mail = params.get("email");

    if (!token) {
      Swal.fire("Error", "Invalid or expired link", "error");
      navigate("/auth");
      return;
    }

    setSocialToken(token);
    if (mail) setEmail(mail);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      Swal.fire("Error", "Password must be at least 6 characters", "error");
      return;
    }

    if (password !== confirm) {
      Swal.fire("Error", "Passwords don't match", "error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiService.request("/auth/social-complete", {
        method: "POST",
        body: JSON.stringify({
          social_token: socialToken,
          password,
          confirm_password: confirm,
        }),
        headers: { "Content-Type": "application/json" },
        includeAuth: false,
        skipAuthLogout: true,
      });

      if (res && res.status) {
        setAuthData(res.data);

        Swal.fire({
          icon: "success",
          title: "Account Created",
          text: "You are now logged in",
          confirmButtonColor: "#6366f1",
          timer: 2000,
          showConfirmButton: false,
        });

        // Redirect based on user type
        if (res.data.user?.user_type === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        Swal.fire("Error", res.message || "Failed to complete signup", "error");
      }
    } catch (err: any) {
      console.error("Social signup error:", err);
      let msg = "Something went wrong. Please try again.";
      if (err?.response?.data?.message) msg = err.response.data.message;
      Swal.fire("Error", msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4">
      <Card className="w-full max-w-md border-indigo-100/70 shadow-xl rounded-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Complete Sign Up</CardTitle>
          <CardDescription>
            Set a password for <strong>{email || "your account"}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-gradient-to-r from-indigo-600 to-sky-500 text-white"
              disabled={isLoading || isSubmitDisabled}
            >
              {isLoading ? "Saving..." : "Save & Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteSocialSignup;
