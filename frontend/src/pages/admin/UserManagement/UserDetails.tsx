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
  Shield,
  Activity,
  ArrowLeft,
  Crown,
  Edit,
  Clock,
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
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/admin/users")}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Profile</h1>
              <p className="text-sm text-gray-500">View and manage user details</p>
            </div>
          </div>
          
          <div className="flex items-center">
              <Button 
                 onClick={() => navigate(`/admin/edituser/${user.id}`)}
                 className="bg-indigo-600 hover:bg-indigo-700 text-white"
               >
                 <Edit className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: User Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl font-semibold">
                        {initials}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold text-gray-900">{user.user_fname} {user.user_lname}</h2>
                  <p className="text-gray-500 text-sm">@{user.user_name}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-md text-indigo-600">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-500 font-medium">Email Address</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-md text-indigo-600">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                      <p className="text-sm font-medium text-gray-900">{user.user_phone || "Not Provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-md text-indigo-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Join Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(user.created_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Summary */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Activity className="h-4 w-4 text-indigo-600" />
                        Usage Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-gray-500 text-xs font-medium mb-1">Total Plans</p>
                            <p className="text-xl font-semibold text-gray-900">{planHistory.length}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-gray-500 text-xs font-medium mb-1">Active</p>
                            <p className="text-xl font-semibold text-gray-900">{activeSubscription ? 1 : 0}</p>
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
                  <Card className="shadow-sm border-indigo-100 bg-white">
                    <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Crown className="h-5 w-5 text-yellow-500" />
                            Active Subscription
                          </CardTitle>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="mb-4 sm:mb-0">
                          <p className="text-sm font-medium text-gray-500 mb-1">Current Plan</p>
                          <p className="text-xl font-bold text-gray-900">{activeSubscription.plan_name || activeSubscription.Plan?.name}</p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-sm font-medium text-gray-500 mb-1">Monthly Cost</p>
                          <p className="text-xl font-bold text-gray-900">₹{Math.floor(activeSubscription.plan_price || activeSubscription.amount_paid)}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-indigo-600" />
                                    AI Credits Usage
                                </h4>
                            </div>
                            <div className="text-sm">
                                <span className="font-semibold text-gray-900">{activeSubscription.ai_posts_used}</span>
                                <span className="text-gray-500 mx-1">/</span>
                                <span className="text-gray-500">{activeSubscription.ai_posts}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Progress 
                                value={(activeSubscription.ai_posts_used / (activeSubscription.ai_posts || 1)) * 100} 
                                className="h-2 bg-gray-100"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{(activeSubscription.ai_posts_used / (activeSubscription.ai_posts || 1) * 100).toFixed(0)}% Used</span>
                                <span>{(activeSubscription.ai_posts || 0) - activeSubscription.ai_posts_used} Remaining</span>
                            </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                            <div className="text-gray-400">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Billing Cycle</p>
                                <p className="text-sm font-semibold text-gray-900">Monthly</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                            <div className="text-gray-400">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Valid Since</p>
                                <p className="text-sm font-semibold text-gray-900">{formatDate(activeSubscription.start_date)}</p>
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
                  <Card className="shadow-sm border-gray-200 bg-gray-50 p-8 text-center">
                    <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No Active Subscription</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mt-1">
                      This user currently doesn't have an active plan.
                    </p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Plan History Table */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    <CardTitle className="text-base font-semibold text-gray-900">Billing History</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Plan Name</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Amount</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {planHistory.length > 0 ? (
                                planHistory.slice(0, 5).map((plan, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-900">{plan.plan_name || plan.Plan?.name || "Standard Plan"}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-500">{formatDate(plan.start_date)}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-900">₹{Math.floor(plan.amount_paid)}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="outline" className={`text-[10px] font-medium py-0.5 px-2 ${
                                                plan.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                                {plan.status}
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
