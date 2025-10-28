import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiService } from "@/services/api";
import { setAuthData, isAuthenticated, onAuthStateChange } from "@/utils/auth";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userFname, setUserFname] = useState("");
  const [userLname, setUserLname] = useState("");
  const [userPhone, setUserPhone] = useState("");
 

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      const authData = JSON.parse(localStorage.getItem("authData") || "null");
      if (authData?.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
      return;
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((authData) => {
      if (authData) {
        if (authData.user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    });

    return unsubscribe;
  }, [navigate]);
 

  const handleSignIn = async (e: React.FormEvent) => {
   
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.login({
        email,
        password,
      });

      
      if (response.status) {
        // Store auth data in localStorage
        setAuthData(response.data);
        toast({
          title: "Success",
          description: "Signed in successfully!",
        });
        // Fallback navigation if onAuthStateChange does not trigger
        if (response.data.user?.role === "admin") {
          window.location.reload();
          navigate("/admin");
        } else {
          window.location.reload();
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowOtp(false);
    setOtpStatus("");
    try {
      const response = await apiService.register({
        user_name: userName,
        email,
        password,
        user_fname: userFname,
        user_lname: userLname,
        user_phone: userPhone,
      });
      if (response.status) {
        toast({
          title: "Success",
          description: "Account created! OTP sent to email.",
        });
        setShowOtp(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setOtpStatus("");
    try {
      const response = await apiService.verifyOtp({ email, otp });
      if (response.status) {
        setOtpStatus("Email verified successfully!");
  toast({ title: "Verified", description: "Email verified!", variant: "default" });
        setShowOtp(false);
        // Redirect to login page after verification
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
      } else {
        setOtpStatus(response.message || "Verification failed");
        toast({ title: "Error", description: response.message, variant: "destructive" });
      }
    } catch (error: any) {
      setOtpStatus(error.message || "Verification failed");
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
              <div className="mt-6 flex flex-col gap-2">
                <Button type="button" className="w-full" variant="outline" onClick={async () => {
                  try {
                    // Google OAuth popup
                    const google = (window as any).google;
                    if (!google || !google.accounts || !google.accounts.id) {
                      toast({ title: "Google SDK not loaded", variant: "destructive" });
                      return;
                    }

                    console.log("google-->",google)
                  
                    google.accounts.id.prompt((notification: any) => {
                      if (notification.isNotDisplayed()) {
                        toast({ title: "Google login failed", variant: "destructive" });
                        return;
                      }
                    });

                    alert("here--->")
                    google.accounts.id.initialize({
                      client_id:'dwdfwfwfwf',
                      callback: async (response: any) => {
                        try {
                          const res = await apiService.googleLogin({ token: response.credential });
                          setAuthData(res.data);
                          toast({ title: "Google login successful", variant: "default" });
                          navigate("/dashboard");
                        } catch (error: any) {
                          toast({ title: "Google login failed", description: error.message, variant: "destructive" });
                        }
                      },
                    });
                  } catch (error: any) {
                    toast({ title: "Google login failed", description: error.message, variant: "destructive" });
                  }
                }}>
                  Sign in with Google
                </Button>
                <Button type="button" className="w-full" variant="outline" onClick={async () => {
                  try {
                    // Facebook OAuth popup
                    const FB = (window as any).FB;
                    if (!FB) {
                      toast({ title: "Facebook SDK not loaded", variant: "destructive" });
                      return;
                    }
                    FB.login(async (response: any) => {
                      if (response.authResponse) {
                        try {
                          const res = await apiService.facebookLogin({ token: response.authResponse.accessToken });
                          setAuthData(res.data);
                          toast({ title: "Facebook login successful", variant: "default" });
                          navigate("/dashboard");
                        } catch (error: any) {
                          toast({ title: "Facebook login failed", description: error.message, variant: "destructive" });
                        }
                      } else {
                        toast({ title: "Facebook login failed", variant: "destructive" });
                      }
                    }, { scope: 'email,public_profile' });
                  } catch (error: any) {
                    toast({ title: "Facebook login failed", description: error.message, variant: "destructive" });
                  }
                }}>
                  Sign in with Facebook
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="signup">
              {!showOtp ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="johndoe"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-fname">First Name</Label>
                    <Input
                      id="signup-fname"
                      type="text"
                      placeholder="John"
                      value={userFname}
                      onChange={(e) => setUserFname(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-lname">Last Name</Label>
                    <Input
                      id="signup-lname"
                      type="text"
                      placeholder="Doe"
                      value={userLname}
                      onChange={(e) => setUserLname(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign Up
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP (sent to email)</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      required
                      maxLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify OTP
                  </Button>
                  {otpStatus && <div className="text-center text-sm mt-2">{otpStatus}</div>}
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;