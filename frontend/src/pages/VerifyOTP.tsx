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
import { Loader2, Shield } from "lucide-react";
import { apiService } from "@/services/api";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const state = location.state as any;
    if (state?.email) {
      setEmail(state.email);
    } else {
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
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to verify OTP",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full border-indigo-100/70 shadow-xl rounded-2xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-extrabold">
              <span className="bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">
                Verify OTP
              </span>
            </CardTitle>
            <CardDescription>
              Enter the OTP sent to <strong>{email}</strong>
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
                    placeholder="Enter 6 digit OTP"
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
                <p className="text-xs text-gray-500 text-center">
                  Check your email for the OTP
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-md mt-4"
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
            </form>

            {/* Centered Back to Login Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOTP;
