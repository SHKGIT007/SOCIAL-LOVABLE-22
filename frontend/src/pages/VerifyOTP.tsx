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
import { Loader2, Shield, ArrowLeft } from "lucide-react";
import { apiService } from "@/services/api";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get email from navigation state
    const state = location.state as any;
    if (state?.email) {
      setEmail(state.email);
    } else {
      // If no email in state, redirect to forgot password
      navigate("/forgot-password");
    }
  }, [location, navigate]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length < 4) {
      Swal.fire({
        icon: "warning",
        title: "Invalid OTP",
        text: "Please enter a valid OTP",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.verifyOTPforgotPassword({ email, otp });

      if (response.status) {
        Swal.fire({
          icon: "success",
          title: "OTP Verified",
          text: "You can now reset your password",
          confirmButtonColor: "#6366f1",
        });
        // Navigate to reset password page, passing email
        navigate("/reset-password", { state: { email, otp } });
      } else {
        Swal.fire({
          icon: "error",
          title: "Invalid OTP",
          text: response.message || "The OTP you entered is incorrect",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to verify OTP";

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
          onClick={() => navigate("/forgot-password")}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <Card className="shadow-lg border-2 border-indigo-100/50">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Verify OTP
            </CardTitle>
            <CardDescription>
              Enter the OTP code sent to your email: <strong>{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code*</Label>
                <div className="relative">
                  <Shield
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 4-6 digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    maxLength={6}
                    required
                    disabled={isLoading}
                    className="border-gray-300 focus-visible:ring-indigo-500 pl-10 text-center text-lg tracking-widest font-mono"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Check your email for the OTP code
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-md mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> If you didn't receive the OTP, check
                  your spam folder or request a new one.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOTP;
