import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("social_token");
    const mail = params.get("email");
    if (!token) {
      navigate('/auth');
      return;
    }
    setSocialToken(token);
    if (mail) setEmail(mail);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      Swal.fire('Error', 'Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirm) {
      Swal.fire('Error', "Passwords don't match", 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.request('/auth/social-complete', {
        method: 'POST',
        body: { social_token: socialToken, password, confirm_password: confirm },
        includeAuth: false,
        skipAuthLogout: true,
      });

      if (res && res.status) {
        setAuthData(res.data);
        Swal.fire('Success', 'Account created and logged in', 'success');
        navigate('/dashboard', { replace: true });
      } else {
        Swal.fire('Error', res.message || 'Failed to complete signup', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4">
      <Card className="w-full max-w-md border-indigo-100/70 shadow-xl rounded-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Complete Sign Up</CardTitle>
          <CardDescription>Set a password for <strong>{email}</strong></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-10 bg-gradient-to-r from-indigo-600 to-sky-500" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save & Continue'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteSocialSignup;
