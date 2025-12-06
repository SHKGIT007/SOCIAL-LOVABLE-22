import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { apiService } from "@/services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email address",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.sendOTPforgotPassword({ email });

      if (response.status) {
        Swal.fire({
          icon: "success",
          title: "OTP Sent",
          text: "Check your email for the OTP code",
          confirmButtonColor: "#6366f1",
        });
        // Navigate to OTP verification page, passing email
        navigate("/verify-otp", { state: { email } });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to send OTP",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP";

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
          onClick={() => navigate("/auth")}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
        >
          <ArrowLeft size={18} />
          Back to Login
        </button>

        <Card className="shadow-lg border-2 border-indigo-100/50">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Forgot Password?
            </CardTitle>
            <CardDescription>
              Enter your email address and we'll send you an OTP to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address*</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-gray-300 focus-visible:ring-indigo-500 pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-md mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
