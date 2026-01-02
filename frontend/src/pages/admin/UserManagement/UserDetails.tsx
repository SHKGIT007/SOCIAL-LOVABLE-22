import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Badge,
} from "lucide-react";

const formatDateTime = (d: string) => {
  if (!d) return "---";
  return new Date(d).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [planHistory, setPlanHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        <div className="flex items-center justify-center h-full min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="sticky top-0 z-10 -mx-6 px-6 py-4 bg-gradient-to-b from-white/90 to-white/70 backdrop-blur border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">
                User
              </span>{" "}
              Details
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              View complete user profile, subscription, and activity.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/users")}
            className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-indigo-50 transition"
          >
            ← Back
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Username",
              value: user.user_name,
              icon: <User className="h-5 w-5 text-blue-600" />,
            },
            {
              label: "Email",
              value: user.email,
              icon: <Mail className="h-5 w-5 text-purple-600" />,
            },
            {
              label: "Phone",
              value: user.user_phone || "N/A",
              icon: <Phone className="h-5 w-5 text-green-600" />,
            },
            {
              label: "Member Since",
              value: formatDateTime(user.created_at),
              icon: <Calendar className="h-5 w-5 text-amber-600" />,
            },
          ].map((item) => (
            <Card
              key={item.label}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 flex items-center gap-3">
                {item.icon}
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    {item.label}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {item.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subscription Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mt-4">
          {/* Post Quota */}
          <Card className="bg-white border border-gray-200 shadow-sm lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-700">Post Quota</h3>
              </div>
              {activeSubscription ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {activeSubscription.posts_used}
                    </span>
                    <span className="text-2xl text-gray-400">/</span>
                    <span className="text-2xl font-semibold text-gray-600">
                      {activeSubscription.Plan?.ai_posts || 10}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    [plan: {activeSubscription.Plan?.name || "No Plan"}]
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  No active subscription
                </p>
              )}
            </CardContent>
          </Card>

          {/* Active Plan */}
          <Card className="bg-green-50 border border-green-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-green-700" />
                <span className="text-sm font-medium text-green-700">
                  Active Plan
                </span>
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {activeSubscription ? 1 : 0}
              </div>
            </CardContent>
          </Card>

          {/* Expired Plan */}
          <Card className="bg-red-50 border border-red-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-4 w-4 text-red-700" />
                <span className="text-sm font-medium text-red-700">
                  Expired Plan
                </span>
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {
                  planHistory.filter(
                    (sub) =>
                      sub.status === "inactive" &&
                      sub.payment_status === "success"
                  ).length
                }
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="bg-purple-50 border border-purple-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-purple-700" />
                <span className="text-sm font-medium text-purple-700">
                  Status
                </span>
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {user.active_status ? "Active" : "Inactive"}
              </div>
            </CardContent>
          </Card>
        </div>

        {activeSubscription ? (
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-lg">
            <CardHeader className="border-b border-indigo-200 bg-white/50">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-600" />
                Active Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Plan Name
                    </p>
                    <p className="text-lg font-bold text-indigo-600">
                      {activeSubscription.Plan?.name}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Subscription Date
                    </p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {activeSubscription.start_date
                        ? new Date(
                            activeSubscription.start_date
                          ).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "---"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Linked Accounts
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {activeSubscription.Plan?.linked_accounts || 0}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Payment Status
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${
                          activeSubscription.payment_status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {activeSubscription.payment_status?.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-700 font-semibold">
                        {activeSubscription.payment_status === "success"
                          ? "Payment Successful"
                          : "Payment Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Amount Paid
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{activeSubscription.amount_paid}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Total AI Credits
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {activeSubscription.Plan?.ai_posts || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-6 text-center border-red-300 bg-red-50">
            <p className="text-red-700 font-semibold">No Active Subscription</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserDetails;
