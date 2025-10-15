import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap } from "lucide-react"; // Zap icon added for flair
import { apiService } from "@/services/api";
import { setAuthData, isAuthenticated, onAuthStateChange } from "@/utils/auth";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // State variables are preserved
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userFname, setUserFname] = useState("");
  const [userLname, setUserLname] = useState("");
  const [userPhone, setUserPhone] = useState("");
 

  // Define the primary gradient class for theme consistency
  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  // Auth logic is preserved
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
        // Store auth data in localStorage (Preserved)
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
        // Store auth data in localStorage (Preserved)
        setAuthData(response.data);
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
        // Fallback navigation if onAuthStateChange does not trigger
        if (response.data.user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
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

  

  return (
    // Updated Background: Clean light background with subtle, vibrant gradient border/focus
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden p-4">
      {/* Background Blobs (for premium look) - You'd need `animate-blob` defined in CSS */}
      <div className={`absolute w-96 h-96 rounded-full bg-indigo-200/50 blur-3xl opacity-30 top-[-5rem] left-[-5rem] animate-pulse`} />
      <div className={`absolute w-80 h-80 rounded-full bg-cyan-200/50 blur-3xl opacity-30 bottom-[-5rem] right-[-5rem] animate-pulse`} />

      {/* Main Card: Enhanced styling with subtle shadow and border */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-2 border-indigo-100/50">
        <CardHeader className="space-y-1 pt-8">
          <div className="flex justify-center mb-2">
            <Zap className={`w-8 h-8 text-indigo-600`} />
          </div>
          <CardTitle className="text-3xl font-extrabold text-center text-gray-900">
            {/* Title uses gradient for premium branding */}
            <span className={`text-transparent bg-clip-text ${primaryGradientClass}`}>SocialPost AI</span>
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Sign in or create an account to start generating content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            {/* Tabs List: Cleaner look with gradient focus */}
            <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 p-1 mb-6 rounded-xl">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 font-semibold rounded-lg transition-all duration-300"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 font-semibold rounded-lg transition-all duration-300"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab Content */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="font-semibold text-gray-700">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="font-semibold text-gray-700">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>
                {/* Primary Button with Gradient Theme */}
                <Button 
                  type="submit" 
                  className={`w-full h-12 text-lg font-bold shadow-xl shadow-indigo-500/40 hover:scale-[1.01] transition-transform duration-300 ${primaryGradientClass}`} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab Content */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Input Fields (Styled for consistency) */}
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="font-semibold text-gray-700">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="johndoe"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="h-10 border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fname" className="font-semibold text-gray-700">First Name</Label>
                    <Input
                      id="signup-fname"
                      type="text"
                      placeholder="John"
                      value={userFname}
                      onChange={(e) => setUserFname(e.target.value)}
                      required
                      className="h-10 border-gray-300 focus-visible:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-lname" className="font-semibold text-gray-700">Last Name</Label>
                    <Input
                      id="signup-lname"
                      type="text"
                      placeholder="Doe"
                      value={userLname}
                      onChange={(e) => setUserLname(e.target.value)}
                      required
                      className="h-10 border-gray-300 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone" className="font-semibold text-gray-700">Phone Number (Optional)</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="h-10 border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="font-semibold text-gray-700">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="font-semibold text-gray-700">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-10 border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>
                {/* Primary Button with Gradient Theme */}
                <Button 
                  type="submit" 
                  className={`w-full h-12 text-lg font-bold shadow-xl shadow-cyan-500/40 hover:scale-[1.01] transition-transform duration-300 ${primaryGradientClass}`} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;