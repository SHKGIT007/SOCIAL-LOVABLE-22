import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import {
  ArrowLeft,
  Calendar,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
  CreditCard,
  User,
  Mail,
  Phone,
  FileText,
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

interface PostData {
  id: number;
  title: string;
  content: string;
  status: string;
  is_ai_generated: boolean;
  ai_prompt?: string | null;
  scheduled_at?: string | null;
  published_at?: string | null;
  media_urls?: any;
  image_url?: string | null;
  video_url?: string | null;
  created_at: string;
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
  Posts?: PostData[];
}

const UserAnalytics = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const { postId } = location.state || {};
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [postData, setPostData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate("/auth");
      return;
    }

    fetchUserAnalytics();
    fetchPostData();
    fetchUserDashboardStats();
  }, [userId, navigate, postId]);

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

  const fetchPostData = async () => {
    try {
      if (!postId) return;

      const response = await apiService.getPostById(postId);

      if (response.status) {
        setPostData(response.data.post);
      } else {
        console.error("Failed to fetch post");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  const fetchUserDashboardStats = async () => {
    try {
      if (!userId) return;

      const res = await apiService.getUserDashboardStats(userId);

      if (res.status) {
        setDashboardStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats");
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
          <Button onClick={() => navigate("/admin")} className="mt-4">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const allSubscriptions = Array.isArray(userData.Subscriptions)
    ? userData.Subscriptions
    : [];
  const activeSubscription = allSubscriptions?.find(
    (sub) => sub.status === "active"
  );

  const activeCount = allSubscriptions.filter(
    (s) => s.status === "active"
  ).length;
  const expiredCount = allSubscriptions.filter(
    (sub) => sub.status === "inactive" && sub.payment_status === "success"
  ).length;

  const cancelledCount = allSubscriptions.filter(
    (s) => s.status === "cancelled"
  ).length;
  const totalSubscriptions = allSubscriptions.length;

  const isactive = userData.active_status ? "Active" : "Inactive";

  const aiPostsUsed = activeSubscription?.ai_posts_used ?? 0;
  const totalAiPosts = activeSubscription?.Plan?.ai_posts ?? 30;
  const creditsPercentage =
    totalAiPosts > 0 ? (aiPostsUsed / totalAiPosts) * 100 : 0;
  const remainingCredits = Math.max(0, totalAiPosts - aiPostsUsed);

  const statCards = dashboardStats
    ? [
        {
          label: "Total Posts",
          value: dashboardStats.total_created_posts,
          icon: Mail,
          bg: "bg-slate-50",
          border: "border-slate-200",
          iconBg: "bg-slate-600",
          text: "text-slate-700",
        },
        {
          label: "Published",
          value: dashboardStats.published_posts,
          icon: CheckCircle2,
          bg: "bg-green-50",
          border: "border-green-200",
          iconBg: "bg-green-500",
          text: "text-green-700",
        },
        {
          label: "Draft",
          value: dashboardStats.draft_posts,
          icon: FileText,
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          iconBg: "bg-yellow-500",
          text: "text-yellow-700",
        },
        {
          label: "Scheduled",
          value: dashboardStats.scheduled_posts,
          icon: Zap,
          bg: "bg-cyan-50",
          border: "border-cyan-200",
          iconBg: "bg-cyan-500",
          text: "text-cyan-700",
        },
        {
          label: "Failed",
          value: dashboardStats.failed_posts,
          icon: XCircle,
          bg: "bg-red-50",
          border: "border-red-200",
          iconBg: "bg-red-500",
          text: "text-red-700",
        },
        {
          label: "Success Rate",
          value: `${dashboardStats.success_percentage}%`,
          icon: Target,
          bg: "bg-indigo-50",
          border: "border-indigo-200",
          iconBg: "bg-indigo-500",
          text: "text-indigo-700",
        },
      ]
    : [];

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div
          className="
    sticky top-0 z-10
    -mx-2 px-4 py-4
    bg-gradient-to-b from-white/90 to-white/70
    backdrop-blur
    border-b border-indigo-100
    flex flex-col sm:flex-row sm:items-center sm:justify-between
    gap-4
  "
        >
          <div>
            <h1 className="text-3xl font-extrabold">
              <span
                className={`text-transparent bg-clip-text ${primaryGradientClass}`}
              >
                User
              </span>{" "}
              Analytics
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-indigo-50 transition"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Username</p>
                  <p className="text-lg font-bold text-gray-900">
                    {userData.user_name}
                  </p>
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
                  <p className="text-lg font-bold text-gray-900">
                    {userData.user_phone}
                  </p>
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
                  <p className="text-xs text-gray-500 font-medium">
                    Member Since
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(userData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {dashboardStats && (
          <div className="space-y-4">
            {/* Section Heading */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
              <h2 className="text-xl font-bold text-gray-900">
                User Post Activity Stats
              </h2>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {statCards.map((card, index) => (
                <Card
                  key={index}
                  className={`${card.bg} ${card.border} border shadow-sm hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${card.iconBg}`}>
                        <card.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className={`text-sm font-medium ${card.text}`}>
                        {card.label}
                      </span>
                    </div>

                    <div className="text-3xl font-bold text-gray-900">
                      {card.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
            <h2 className="text-xl font-bold text-gray-900">
              Subscription & Usage Overview
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="bg-white border border-gray-200 shadow-sm lg:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-700">Post Quota</h3>
                </div>

                {activeSubscription ? (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          {aiPostsUsed}
                        </span>
                        <span className="text-2xl text-gray-400">/</span>
                        <span className="text-2xl font-semibold text-gray-600">
                          {totalAiPosts}
                        </span>
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
                        Your account has {remainingCredits} posts left in this
                        month’s quota.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      No active subscription
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-green-50 border border-green-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-green-500 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-700">
                    Active Plans
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  {activeCount}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border border-red-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-red-500 rounded-full">
                    <XCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-red-700">
                    Expired Plans
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  {expiredCount}
                </div>
              </CardContent>
            </Card>

            {/* User Status */}
            <Card className="bg-purple-50 border border-purple-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-500 rounded-full">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-purple-700">
                    Account Status
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  {isactive}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {postData && (
          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 py-4">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-md">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                {postData.title || "Untitled Post"}
              </CardTitle>

              <CardDescription className="text-gray-600">
                Posted by {postData.User?.user_fname}{" "}
                {postData.User?.user_lname} ({postData.User?.email})
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Content
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-line shadow-inner">
                  {postData.content}
                </div>
              </div>

              {(postData.image_url || postData.video_url) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Media Preview
                  </p>

                  {postData.image_url && (
                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <img
  src={postData.image_url}
  alt="post"
  className="w-full h-auto max-h-[500px] object-contain"
/>

                    </div>
                  )}

                  {postData.video_url && (
                    <video
                      controls
                      className="w-full rounded-xl border border-gray-200 shadow-sm max-h-[350px]"
                      src={postData.video_url}
                    />
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-md border border-blue-200">
                  {JSON.parse(postData.platforms)?.join(", ")}
                </span>

                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200">
                  Status: {postData.status}
                </span>

                {postData.is_ai_generated && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-md border border-indigo-200">
                    <Zap className="h-3 w-3" />
                    AI Generated
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-600 border-t pt-4 flex flex-col gap-1">
                <span>
                  Created At:{" "}
                  <strong>
                    {new Date(postData.created_at).toLocaleString()}
                  </strong>
                </span>

                {postData.scheduled_at && (
                  <span>
                    Scheduled:{" "}
                    <strong>
                      {new Date(postData.scheduled_at).toLocaleString()}
                    </strong>
                  </span>
                )}

                {postData.published_at && (
                  <span>
                    Published:{" "}
                    <strong>
                      {new Date(postData.published_at).toLocaleString()}
                    </strong>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserAnalytics;
