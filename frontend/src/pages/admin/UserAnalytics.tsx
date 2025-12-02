import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import { 
  ArrowLeft, 
  Calendar, 
  Zap, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Clock,
  CreditCard,
  User,
  Mail,
  Phone
} from "lucide-react";
import DashboardLayout from "@/components/Layout/DashboardLayout";

interface SubscriptionData {
  id: number;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string;
  posts_used: number;
  ai_posts_used: number;
  payment_status: string;
  amount_paid: number;
  Plan?: {
    name: string;
    ai_posts: number;
    linked_accounts: number;
  };
}

interface UserAnalyticsData {
  id: string;
  user_name: string;
  email: string;
  user_fname: string;
  user_lname: string;
  user_phone: string;
  user_type: string;
  active_status: boolean;
  created_at: string;
  Subscriptions: SubscriptionData[];
}

const UserAnalytics = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate("/auth");
      return;
    }

    fetchUserAnalytics();
  }, [userId, navigate]);

  const fetchUserAnalytics = async () => {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const response = await apiService.getUserById(userId);

      if (response.status) {
        setUserData(response.data.user);
      } else {
        throw new Error(response.message || "Failed to fetch user data");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load user analytics",
        confirmButtonColor: "#6366f1",
      });
      navigate("/admin/users");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">User not found</h2>
          <Button onClick={() => navigate("/admin/users")} className="mt-4">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const activeSubscription = userData.Subscriptions?.find(sub => sub.status === "active");
  const allSubscriptions = userData.Subscriptions || [];
  
  const activeCount = allSubscriptions.filter(s => s.status === "active").length;
  const inactiveCount = allSubscriptions.filter(s => s.status === "inactive").length;
  const cancelledCount = allSubscriptions.filter(s => s.status === "cancelled").length;
  const totalSubscriptions = allSubscriptions.length;
  
  const successRate = totalSubscriptions > 0 
    ? ((activeCount / totalSubscriptions) * 100).toFixed(1) 
    : "0";

  const aiPostsUsed = activeSubscription?.ai_posts_used || 0;
  const totalAiPosts = activeSubscription?.Plan?.ai_posts || 100;
  const creditsPercentage = totalAiPosts > 0 ? (aiPostsUsed / totalAiPosts) * 100 : 0;
  const remainingCredits = totalAiPosts - aiPostsUsed;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <DashboardLayout userRole="admin">
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/users")}
              className="gap-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Analytics</h1>
              <p className="text-gray-500 text-sm mt-1">
                {userData.user_fname} {userData.user_lname}
              </p>
            </div>
          </div>
        </div>

        {/* User Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Username</p>
                  <p className="text-lg font-bold text-gray-900">{userData.user_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {userData.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-lg font-bold text-gray-900">{userData.user_phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Member Since</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(userData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Post Quota & Stats - Dashboard Style */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Post Quota Card */}
          <Card className="bg-white border border-gray-200 shadow-sm lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-700">Post Quota</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">{aiPostsUsed}</span>
                    <span className="text-2xl text-gray-400">/</span>
                    <span className="text-2xl font-semibold text-gray-600">{totalAiPosts}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    [plan: {activeSubscription?.Plan?.name || "No Plan"}]
                  </p>
                </div>
                
                <div className="pt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500"
                      style={{ width: `${creditsPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Your account has {remainingCredits} posts left in this month's quota.
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Posted:</span>
                    <span className="font-bold text-gray-900">
                      {activeSubscription?.posts_used || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Compared to last 30 days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card className="bg-green-50 border border-green-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-500 rounded-full">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-green-700">Active</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">{activeCount}</div>
              <p className="text-xs text-green-600 mt-2">+100%</p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border border-red-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-500 rounded-full">
                  <XCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-red-700">Cancelled</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">{cancelledCount}</div>
              <p className="text-xs text-red-600 mt-2">+100%</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border border-purple-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-500 rounded-full">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-purple-700">Success Rate</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">{successRate}%</div>
              <p className="text-xs text-purple-600 mt-2">of total subscriptions</p>
            </CardContent>
          </Card>
        </div>

        {/* All Subscriptions Table */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <CardTitle className="text-xl font-bold text-gray-900">
              Subscription History
            </CardTitle>
            <CardDescription>
              All subscriptions for this user ({totalSubscriptions} total)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {allSubscriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                          Plan
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                          Start Date
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                          End Date
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                          Posts Used
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                          AI Posts
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                          Payment
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSubscriptions.map((sub, index) => (
                        <tr
                          key={sub.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            sub.status === "active" ? "bg-green-50" : ""
                          }`}
                        >
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            #{sub.id}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {sub.Plan?.name || "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={`${getStatusColor(sub.status)} border text-xs`}
                            >
                              {sub.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {sub.start_date
                              ? new Date(sub.start_date).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {sub.end_date
                              ? new Date(sub.end_date).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                            {sub.posts_used || 0}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-indigo-600">
                            {sub.ai_posts_used || 0}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={`${
                                sub.payment_status === "success"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              } text-xs`}
                            >
                              {sub.payment_status?.toUpperCase() || "N/A"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-gray-900">
                            ₹{sub.amount_paid || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No subscriptions found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    This user hasn't subscribed to any plan yet.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Active Subscription Details */}
        {activeSubscription && (
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-lg">
            <CardHeader className="border-b border-indigo-200 bg-white/50">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-600" />
                Current Active Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">Plan Name</p>
                    <p className="text-lg font-bold text-indigo-600">
                      {activeSubscription.Plan?.name}
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">Duration</p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {new Date(activeSubscription.start_date).toLocaleDateString()} -{" "}
                      {new Date(activeSubscription.end_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">Linked Accounts</p>
                    <p className="text-lg font-bold text-gray-900">
                      {activeSubscription.Plan?.linked_accounts || 0}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">Payment Status</p>
                    <Badge
                      className={`${
                        activeSubscription.payment_status === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {activeSubscription.payment_status?.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">Amount Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{activeSubscription.amount_paid}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">Total AI Credits</p>
                    <p className="text-lg font-bold text-gray-900">
                      {activeSubscription.Plan?.ai_posts || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};

export default UserAnalytics;