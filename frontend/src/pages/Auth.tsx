import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";
import { apiService } from "@/services/api";
import { setAuthData, isAuthenticated, onAuthStateChange } from "@/utils/auth";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userFname, setUserFname] = useState("");
  const [userLname, setUserLname] = useState("");
  const [userPhone, setUserPhone] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      const authData = JSON.parse(localStorage.getItem("authData") || "null");
      if (authData?.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
      return;
    }

    const unsubscribe = onAuthStateChange((authData) => {
      if (authData) {
        if (authData.user?.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      if (response.status) {
        setAuthData(response.data);
        Swal.fire({ icon: "success", title: "Success", text: "Signed in successfully!", confirmButtonColor: "#6366f1" });
        if (response.data.user?.role === "admin") {
          window.location.reload();
          navigate("/admin");
        } else {
          window.location.reload();
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Login failed", confirmButtonColor: "#6366f1" });
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
        setAuthData(response.data);
        Swal.fire({ icon: "success", title: "Success", text: "Account created successfully!", confirmButtonColor: "#6366f1" });
        if (response.data.user?.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Registration failed", confirmButtonColor: "#6366f1" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4">
      <Card className="w-full max-w-md border-indigo-100/70 shadow-xl rounded-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-extrabold">
            <span className="bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">Welcome</span>{" "}
           
          </CardTitle>
          <CardDescription>Sign in or create an account to get started</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            {/* FULL-WIDTH, THEMED TABS */}
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

            {/* SIGN IN */}
            <TabsContent value="signin" className="mt-6">
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
                    className="border-gray-300 focus-visible:ring-indigo-500"
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
                    className="border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-md"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            {/* SIGN UP */}
            <TabsContent value="signup" className="mt-6">
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
                    className="border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fname">First Name</Label>
                    <Input
                      id="signup-fname"
                      type="text"
                      placeholder="John"
                      value={userFname}
                      onChange={(e) => setUserFname(e.target.value)}
                      required
                      className="border-gray-300 focus-visible:ring-indigo-500"
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
                      className="border-gray-300 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="border-gray-300 focus-visible:ring-indigo-500"
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
                    className="border-gray-300 focus-visible:ring-indigo-500"
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
                    className="border-gray-300 focus-visible:ring-indigo-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-md"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
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
