import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { formatDate, formatDateTime } from "@/utils/dateFormatter";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  Calendar,
  Mail,
  Phone,
  User,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
  CreditCard,
  Clock,
  Shield,
  Activity,
  ArrowLeft,
  Crown,
} from "lucide-react";

// Using utility functions from @/utils/dateFormatter

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [planHistory, setPlanHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const res = await apiService.getUserById(id);
      if (res.status === true) {
        const userData = res.data.user;
        setUser(userData);

        const activeSub = userData.Subscriptions.find(
          (sub: any) => sub.status === "active"
        );
        setActiveSubscription(activeSub || null);
        setPlanHistory(userData.Subscriptions || []);
      } else {
        Swal.fire("Error", res.message || "User not found", "error");
        navigate("/admin/users");
      }
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
      navigate("/admin/users");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <User className="h-6 w-6 text-indigo-400" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const initials = `${user.user_fname?.[0] || ""}${user.user_lname?.[0] || ""}`.toUpperCase() || user.user_name?.[0]?.toUpperCase() || "U";

  return (
    <DashboardLayout userRole="admin">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-7xl mx-auto"
      >
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-6 rounded-2xl border border-indigo-50 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/users")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                <span className={`text-transparent bg-clip-text ${primaryGradientClass}`}>
                  User
                </span>{" "}
                Profile
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button 
                variant="outline" 
                onClick={() => navigate(`/admin/edituser/${user.id}`)}
                className="hidden sm:flex"
              >
                Edit Profile
             </Button>
           
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: User Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-none shadow-xl bg-white group">
              <div className={`h-24 ${primaryGradientClass} opacity-80 group-hover:opacity-100 transition-opacity`} />
              <CardContent className="px-6 pb-6 pt-0 relative">
                <div className="flex flex-col items-center -mt-12 mb-6">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-2 ring-indigo-50">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-bold">
                        {initials}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold mt-4 text-gray-900">{user.user_fname} {user.user_lname}</h2>
                  <p className="text-gray-500 font-medium">@{user.user_name}</p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                    <Mail className="h-5 w-5 text-indigo-500" />
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-semibold text-gray-700 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                    <Phone className="h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Phone Number</p>
                      <p className="text-sm font-semibold text-gray-700">{user.user_phone || "Not Provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Join Date</p>
                      <p className="text-sm font-semibold text-gray-700">{formatDateTime(user.created_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Summary */}
            <Card className="border-none shadow-lg bg-indigo-900 text-white overflow-hidden">
                <CardContent className="p-6 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Activity className="h-24 w-24" />
                    </div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Usage Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                            <p className="text-indigo-200 text-xs font-bold uppercase">Total Plans</p>
                            <p className="text-2xl font-black">{planHistory.length}</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                            <p className="text-indigo-200 text-xs font-bold uppercase">Active</p>
                            <p className="text-2xl font-black">{activeSubscription ? 1 : 0}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* Right Column: Dynamic Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Subscription Section */}
            <AnimatePresence mode="wait">
              {activeSubscription ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  key="active-sub"
                >
                  <Card className="border-none shadow-xl bg-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110" />
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <CardTitle className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            <Crown className="h-6 w-6 text-yellow-500" />
                            {activeSubscription.plan_name || activeSubscription.Plan?.name || "Subscription"}
                          </CardTitle>
                          <CardDescription>Managed enterprise-level features</CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-sm py-1.5 px-4 animate-pulse">
                          ACTIVE NOW
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">Current Plan</p>
                          <p className="text-3xl font-black text-indigo-900">{activeSubscription.plan_name || activeSubscription.Plan?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">Monthly Cost</p>
                          <p className="text-3xl font-black text-gray-900">₹{activeSubscription.plan_price || activeSubscription.amount_paid}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h4 className="font-bold text-gray-700 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-indigo-600" />
                                    AI Credits Usage
                                </h4>
                                <p className="text-sm text-gray-500">Monthly quota allocation</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-indigo-600">{activeSubscription.ai_posts_used}</span>
                                <span className="text-gray-400 mx-1">/</span>
                                <span className="text-lg font-bold text-gray-600">{activeSubscription.ai_posts}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Progress 
                                value={(activeSubscription.ai_posts_used / (activeSubscription.ai_posts || 1)) * 100} 
                                className="h-3 bg-indigo-100 [&>div]:bg-indigo-600"
                            />
                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                                <span>Used</span>
                                <span>Remaining: {(activeSubscription.ai_posts || 0) - activeSubscription.ai_posts_used}</span>
                            </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
                            <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Billing Cycle</p>
                                <p className="text-sm font-black text-gray-800">Monthly (Manual)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
                            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Valid Since</p>
                                <p className="text-sm font-black text-gray-800">{formatDate(activeSubscription.start_date)}</p>
                            </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key="no-sub"
                >
                  <Card className="border-2 border-dashed border-red-200 bg-red-50/30 p-12 text-center group">
                    <div className="bg-red-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="text-xl font-black text-red-900">No Active Subscription</h3>
                    <p className="text-red-600/70 max-w-sm mx-auto mt-2">
                      This user doesn't have an active plan. Manage plans or contact the user to upgrade.
                    </p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Plan History Table */}
            <Card className="border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Billing History</CardTitle>
                        <CardDescription>Recent transactions and plan history</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Plan Name</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {planHistory.length > 0 ? (
                                planHistory.slice(0, 5).map((plan, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{plan.plan_name || plan.Plan?.name || "Standard Plan"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-700">{formatDate(plan.start_date)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-indigo-600">₹{plan.amount_paid}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`text-[10px] py-0 px-2 h-5 ${
                                                plan.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 
                                                'bg-gray-100 text-gray-600 border-gray-200'
                                            } border`}>
                                                {plan.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                                        No transaction history found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default UserDetails;
