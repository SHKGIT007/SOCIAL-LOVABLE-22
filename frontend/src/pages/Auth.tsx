import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Swal from "sweetalert2";
import { Loader2, Eye, EyeOff, Mail, CheckCircle } from "lucide-react";
import { apiService } from "@/services/api";
import { API_CONFIG } from "@/utils/config";
import { setAuthData, isAuthenticated, getAuthData } from "@/utils/auth";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userFname, setUserFname] = useState("");
  const [userLname, setUserLname] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // OTP states
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    if (isAuthenticated()) {
      const authData = getAuthData();
      if (authData?.user?.user_type === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [navigate]);

  // Handle redirect from Google OAuth (token present in URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const success = params.get('success');
    const socialError = params.get('social_error') || params.get('error');

    // If Google redirected back with an error (e.g., email already registered), show a popup
    if (socialError) {
      let message = 'Authentication failed';
      if (socialError === 'email_exists') message = 'Email is already registered. Please login.';
      if (socialError === 'auth_failed') message = 'Authentication failed. Please try again.';

      Swal.fire({ icon: 'error', title: 'Error', text: message, confirmButtonColor: '#ef4444' });

      // Clean the URL params
      const url = new URL(window.location.href);
      url.searchParams.delete('social_error');
      url.searchParams.delete('error');
      url.searchParams.delete('success');
      window.history.replaceState({}, document.title, url.toString());
      return;
    }

    if (tokenFromUrl && success === 'true') {
      (async () => {
        try {
          // Fetch profile using token
          const profileRes = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.PROFILE}`,
            {
              headers: {
                Authorization: `Bearer ${tokenFromUrl}`,
              },
            }
          );

          if (!profileRes.ok) throw new Error('Failed to fetch profile');

          const json = await profileRes.json();
          if (json && json.status) {
            const authPayload = { token: tokenFromUrl, user: json.data.user };
            setAuthData(authPayload);
            if (authPayload.user?.user_type === 'admin') {
              navigate('/admin', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          }
        } catch (err) {
          console.error('Google login handling failed', err);
        } finally {
          // Clean URL to remove token
          const url = new URL(window.location.href);
          url.searchParams.delete('token');
          url.searchParams.delete('success');
          window.history.replaceState({}, document.title, url.toString());
        }
      })();
    }
  }, [navigate]);

  // OTP Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Format timer display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Send OTP to email
  const handleSendOTP = async () => {
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email first",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.sendOTP({ email });

      if (response && response.status) {
        setIsOtpSent(true);
        setOtpTimer(60); // 1 minute = 60 seconds

        Swal.fire({
          icon: "success",
          title: "OTP Sent",
          text: "Please check your email for the OTP code",
          confirmButtonColor: "#6366f1",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // show backend error message when sendOTP returns failure
        Swal.fire({
          icon: "error",
          title: "Failed to send OTP",
          text: response?.message || response?.errors?.[0]?.msg || "Failed to send OTP. Please try again.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error?.response?.data?.message ||
          "Failed to send OTP. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Invalid OTP",
        text: "Please enter a valid 6-digit OTP",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.verifyOTP({ email, otp });

      if (response && response.status) {
        setIsOtpVerified(true);

        Swal.fire({
          icon: "success",
          title: "Email Verified!",
          text: "Now complete your registration details",
          confirmButtonColor: "#6366f1",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text:
          error?.response?.data?.message ||
          "Invalid or expired OTP. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    // Basic client-side validation for password
    if (!loginPassword || loginPassword.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Password',
        text: 'Password must be at least 6 characters',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.login({
        email: loginEmail,
        password: loginPassword,
      });

      if (response && response.status) {
        setAuthData(response.data);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Signed in successfully!",
          confirmButtonColor: "#6366f1",
          timer: 1500,
          showConfirmButton: false,
        });

        setTimeout(() => {
          if (response.data.user?.user_type === "admin") {
            navigate("/admin", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }, 1500);
      } else {
        // Handle case where response.status is false
        setIsLoading(false);

        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text:
            response?.message || "Invalid email or password. Please try again.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error: any) {
      setIsLoading(false);

      // Get the error message from various possible locations
      let errorMessage = "Invalid email or password. Please try again.";

      if (error?.response?.data) {
        const data = error.response.data;

        // Check for validation errors array
        if (
          data.errors &&
          Array.isArray(data.errors) &&
          data.errors.length > 0
        ) {
          errorMessage = data.errors[0].msg;
        }
        // Check for general message
        else if (data.message) {
          errorMessage = data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: errorMessage,
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOtpVerified) {
      Swal.fire({
        icon: "warning",
        title: "Email Not Verified",
        text: "Please verify your email with OTP first",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await apiService.register({
        user_name: userName,
        email,
        password,
        user_fname: userFname,
        user_lname: userLname,
        user_phone: userPhone,
        otp,
      });

      if (response && response.status) {
        setAuthData(response.data);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Account created successfully!",
          confirmButtonColor: "#6366f1",
          timer: 1500,
          showConfirmButton: false,
        });

        setTimeout(() => {
          if (response.data.user?.user_type === "admin") {
            navigate("/admin", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }, 1500);
      } else {
        // Handle case where response.status is false
        setIsLoading(false);
        
        const errText = response?.message || response?.errors?.[0]?.msg || "Unable to create account. Please try again.";

        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: errText,
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error: any) {
      setIsLoading(false);

      // Get the error message from various possible locations
      let errorMessage = "Unable to create account. Please try again.";
      
      if (error?.response?.data) {
        const data = error.response.data;
        
        // First priority: Check for validation errors array with detailed message
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          // Get the first error's message
          errorMessage = data.errors[0].msg || data.errors[0].message || errorMessage;
        } 
        // Second priority: Check for general message
        else if (data.message) {
          errorMessage = data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: errorMessage,
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4">
      <Card className="w-full max-w-md border-indigo-100/70 shadow-xl rounded-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-extrabold">
            <span className="bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">
              Welcome
            </span>
          </CardTitle>
          <CardDescription>
            Sign in or create an account to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-indigo-50 p-1">
              <TabsTrigger
                value="signin"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* ========== SIGN IN TAB ========== */}
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email*</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password*</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="border-gray-300 focus-visible:ring-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {/* removed Google button from Sign In - Sign Up flow is preferred */}
              </form>
            </TabsContent>

            {/* ========== SIGN UP TAB ========== */}
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username*</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Your Username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>

                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fname">First Name*</Label>
                    <Input
                      id="signup-fname"
                      type="text"
                      placeholder="John"
                      value={userFname}
                      onChange={(e) => setUserFname(e.target.value)}
                      required
                      disabled={isLoading}
                      className="border-gray-300 focus-visible:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-lname">Last Name*</Label>
                    <Input
                      id="signup-lname"
                      type="text"
                      placeholder="Doe"
                      value={userLname}
                      onChange={(e) => setUserLname(e.target.value)}
                      required
                      disabled={isLoading}
                      className="border-gray-300 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number*</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="+91 12345 67890"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email*</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading || isOtpVerified}
                    className="border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>

                {/* Send OTP Button - Shows after email entered */}
                {email && !isOtpSent && (
                  <Button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isLoading || otpTimer > 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Mail size={18} className="mr-2" />
                        Send OTP
                      </>
                    )}
                  </Button>
                )}

                {/* OTP Input - Shows after Send OTP clicked */}
                {isOtpSent && !isOtpVerified && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP*</Label>
                    <div className="flex gap-2">
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        maxLength={6}
                        required
                        disabled={isLoading}
                        className="border-gray-300 focus-visible:ring-indigo-500 flex-1 text-center text-lg tracking-widest"
                      />
                      {/* Resend OTP button */}
                      {isOtpSent && !isOtpVerified && otpTimer === 0 && (
                        <Button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={isLoading}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Mail size={18} className="mr-2" />
                          Resend OTP
                        </Button>
                      )}

                      <Button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={isLoading || otp.length !== 6}
                        className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <p className="text-gray-500">OTP sent to your email</p>
                      {otpTimer > 0 && (
                        <p className="text-indigo-600 font-medium">
                          {formatTime(otpTimer)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Verified Message */}
                {isOtpVerified && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle size={20} className="text-green-600" />
                    <p className="text-sm text-green-700 font-medium">
                      Email verified successfully!
                    </p>
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password*</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      // placeholder="Password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isLoading}
                      className="border-gray-300 focus-visible:ring-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
                <div className="mt-3">
                  <Button
                    type="button"
                    className="w-full h-10 bg-white border border-gray-200 text-gray-700"
                    onClick={() => {
                      const backendBase = API_CONFIG.BASE_URL.replace('/api', '');
                      const redirectDashboard = window.location.origin + '/dashboard';
                      window.location.href = `${backendBase}/auth/google?redirect_dashboard=${encodeURIComponent(
                        redirectDashboard
                      )}&action=signup`;
                    }}
                  >
                    Sign up with Google
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
