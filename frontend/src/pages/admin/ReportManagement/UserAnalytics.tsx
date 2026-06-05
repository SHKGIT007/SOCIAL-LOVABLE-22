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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import { getDisplayImageUrl } from "@/utils/imageHelper";
import { formatDate, formatDateTime } from "@/utils/dateFormatter";
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
  Activity,
  BarChart3,
  Globe,
  Clock,
  ExternalLink,
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
  monthly_posts: number;
  ai_posts: number;
  linked_accounts: number;
  plan_name: string | null;
  plan_price: string | number | null;
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
  platforms?: string;
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
  const [postData, setPostData] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  const getPlatformsArray = (platforms: any): string[] => {
    if (!platforms) return [];

    // already array
    if (Array.isArray(platforms)) return platforms;

    // JSON string or other string format
    if (typeof platforms === "string") {
      try {
        const parsed = JSON.parse(platforms);
        if (Array.isArray(parsed)) return parsed;

        // If parsed is not an array, maybe it was a single string that's actually comma-separated
        return platforms
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
      } catch {
        // Not JSON, try as comma-separated string
        return platforms
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
      }
    }

    // object case { facebook: true, instagram: true }
    if (typeof platforms === "object") {
      return Object.keys(platforms);
    }

    return [];
  };

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
      if (!userId) throw new Error("User ID is required");
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
      if (response.status) setPostData(response.data.post);
    } catch (error) {}
  };

  const fetchUserDashboardStats = async () => {
    try {
      if (!userId) return;
      const res = await apiService.getUserDashboardStats(userId);
      if (res.status) setDashboardStats(res.data);
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-16 w-16 bg-indigo-100 rounded-full mb-4 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-indigo-600 animate-bounce" />
                </div>
                <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Loading User Data...</p>
            </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout userRole="admin">
        <div className="text-center py-20">
          <Avatar className="h-24 w-24 mx-auto mb-4 border-2 border-dashed border-gray-300">
             <AvatarFallback className="bg-gray-50 text-gray-400">?</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-gray-800">User not found</h2>
          <Button onClick={() => navigate("/admin/users")} className="mt-4">
            Back to Users
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const activeSubscription = userData.Subscriptions?.find((sub) => sub.status === "active");
  const chartData = dashboardStats ? [
    { name: 'Published', value: dashboardStats.published_posts, color: '#10b981' },
    { name: 'Draft', value: dashboardStats.draft_posts, color: '#f59e0b' },
    { name: 'Scheduled', value: dashboardStats.scheduled_posts, color: '#06b6d4' },
    { name: 'Failed', value: dashboardStats.failed_posts, color: '#ef4444' },
  ].filter(d => d.value > 0) : [];

  const statCards = dashboardStats ? [
    { label: "Total Posts", value: dashboardStats.total_created_posts, icon: FileText, color: "blue" },
    { label: "Published", value: dashboardStats.published_posts, icon: CheckCircle2, color: "emerald" },
    { label: "Scheduled", value: dashboardStats.scheduled_posts, icon: Clock, color: "cyan" },
    { label: "Drafts", value: dashboardStats.draft_posts, icon: FileText, color: "amber" },
    { label: "Failed", value: dashboardStats.failed_posts, icon: XCircle, color: "rose" },
    { label: "Success Rate", value: `${dashboardStats.success_percentage}%`, icon: Target, color: "indigo" },
  ] : [];

  const aiPostsUsed = activeSubscription?.ai_posts_used ?? 0;
  const totalAiPosts = activeSubscription?.ai_posts ?? 1;
  const usagePercentage = Math.min(100, (aiPostsUsed / totalAiPosts) * 100);

  return (
    <DashboardLayout userRole="admin">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="space-y-6 max-w-7xl mx-auto pb-10"
      >
        {/* Modern Header - Simplified */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-5">
            <Avatar className="h-16 w-16 border border-gray-200">
               <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`} />
               <AvatarFallback className="bg-indigo-600 text-white">{userData.user_fname?.[0]}{userData.user_lname?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {userData.user_fname} {userData.user_lname}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-500 font-medium text-sm">@{userData.user_name}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(-1)} 
              className="bg-white border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
        </div>

        {/* User Info Quick Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
                { icon: Mail, label: "Email", value: userData.email, color: "bg-blue-50 text-blue-600" },
                { icon: Phone, label: "Phone", value: userData.user_phone || "N/A", color: "bg-emerald-50 text-emerald-600" },
                { icon: User, label: "Type", value: userData.user_type, color: "bg-purple-50 text-purple-600" },
                { icon: Calendar, label: "Joined", value: formatDate(userData.created_at), color: "bg-amber-50 text-amber-600" },
            ].map((item, i) => (
                <Card key={i} className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${item.color}`}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">{item.label}</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{item.value}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Data & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Post Stats & Distribution */}
            <Card className="lg:col-span-2 border border-gray-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900">
                            <Activity className="h-5 w-5 text-indigo-500" />
                            Post Performance
                        </CardTitle>
                        <CardDescription>Visual breakdown of user activities</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="h-[250px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            animationBegin={0}
                                            animationDuration={1500}
                                        >
                                            {chartData.map((entry: any, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <BarChart3 className="h-12 w-12 mb-2 opacity-20" />
                                    <p className="text-sm italic">No post data available</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {statCards.map((stat, i) => (
                                <div 
                                    key={i}
                                    className={`p-4 rounded-xl border border-gray-200 bg-gray-50/50`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
                                        <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">{stat.label}</p>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Subscription Usage Card */}
            <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden flex flex-col">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Usage Quota
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col justify-center space-y-8">
                    {activeSubscription ? (
                        <>
                            <div className="text-center">
                                <div className="inline-block p-4 rounded-full bg-indigo-50 mb-4 border border-indigo-100">
                                    <Zap className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 leading-none">{aiPostsUsed}</h3>
                                <p className="text-gray-500 font-semibold uppercase text-xs mt-2 tracking-wider">Total Credits Used</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs font-semibold uppercase text-gray-500 tracking-wider">
                                    <span>Plan Progress</span>
                                    <span className="text-indigo-600 font-bold">{Math.round(usagePercentage)}%</span>
                                </div>
                                <div className="relative pt-1">
                                    <Progress value={usagePercentage} className="h-2 bg-indigo-50" />
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center flex justify-around">
                                    <div>
                                      <p className="text-xl font-bold text-gray-900">{totalAiPosts - aiPostsUsed}</p>
                                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Remaining</p>
                                    </div>
                                    <div className="w-px bg-gray-200 mx-2"></div>
                                    <div>
                                      <p className="text-xl font-bold text-gray-900">{totalAiPosts}</p>
                                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Total Limit</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm font-medium text-center border border-gray-200">
                                    Current Plan: <span className="font-bold text-indigo-600">{activeSubscription.plan_name || activeSubscription.Plan?.name}</span>
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="inline-block p-6 rounded-full bg-gray-50 border border-gray-200">
                                <Activity className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">No active plan</h3>
                                <p className="text-sm text-gray-500 max-w-[200px] mx-auto">This user currently has no active subscription credits.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Specific Post Deep-Dive (if postId provided) */}
        <AnimatePresence>
            {postData && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-6"
                >
                    <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden rounded-xl">
                        <CardHeader className="bg-gray-50/50 p-6 flex flex-row items-center justify-between border-b border-gray-100">
                            <div className="space-y-1">
                                <Badge variant="outline" className="text-indigo-600 border-indigo-200 mb-2">TARGETED POST</Badge>
                                <CardTitle className="text-xl font-bold text-gray-900">
                                    {postData.title || "Untitled Insight"}
                                </CardTitle>
                            </div>
                            <Badge className={`px-4 py-1.5 text-xs font-semibold shadow-sm ${
                                postData.status === 'published' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 
                                postData.status === 'failed' ? 'bg-rose-500 text-white hover:bg-rose-600' : 
                                'bg-indigo-500 text-white hover:bg-indigo-600'
                            }`}>
                                {postData.status.toUpperCase()}
                            </Badge>
                        </CardHeader>
                        
                        <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-indigo-500" /> Post Content
                                    </label>
                                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-gray-800 text-sm leading-relaxed min-h-[120px]">
                                        {postData.content}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col justify-center items-center text-center">
                                        <Globe className="h-5 w-5 text-indigo-500 mb-2" />
                                        <p className="text-[10px] font-semibold uppercase text-gray-500 tracking-wider">Platforms</p>
                                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                                            {getPlatformsArray(postData.platforms).map((p: string, i: number) => (
                                                <Badge key={i} variant="outline" className="capitalize text-[10px] bg-white">{p}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col justify-center items-center text-center">
                                        <Zap className={`h-5 w-5 ${postData.is_ai_generated ? 'text-indigo-500' : 'text-gray-400'} mb-2`} />
                                        <p className="text-sm font-bold text-gray-900 mt-1">{postData.is_ai_generated ? 'AI Generated' : 'Manual'}</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg border border-gray-200 bg-white">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs font-semibold uppercase text-gray-500">
                                            <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Timeline</span>
                                        </div>
                                        <div className="space-y-2 pt-2 border-t border-gray-100">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Created:</span>
                                                <span className="font-medium text-gray-900">{formatDateTime(postData.created_at)}</span>
                                            </div>
                                            {postData.scheduled_at && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">Scheduled:</span>
                                                    <span className="font-medium text-gray-900">{formatDateTime(postData.scheduled_at)}</span>
                                                </div>
                                            )}
                                            {postData.published_at && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">Published:</span>
                                                    <span className="font-medium text-gray-900">{formatDateTime(postData.published_at)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-indigo-500" /> Media Visuals
                                </label>
                                <div className="aspect-[4/5] md:aspect-square w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shadow-sm flex items-center justify-center">
                                    {postData.image_url ? (
                                        <img 
                                            src={getDisplayImageUrl(postData.image_url)} 
                                            alt="insight preview" 
                                            className="w-full h-full object-contain bg-white"
                                        />
                                    ) : postData.video_url ? (
                                        <video controls className="w-full h-full bg-black">
                                            <source src={postData.video_url} />
                                        </video>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                            <Activity className="h-10 w-10 mb-2 opacity-30" />
                                            <p className="text-sm font-medium">No Media Provided</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

export default UserAnalytics;
