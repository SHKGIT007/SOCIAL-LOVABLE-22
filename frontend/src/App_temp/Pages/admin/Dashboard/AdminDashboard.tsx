import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, CreditCard, TrendingUp, Zap } from "lucide-react";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import { isAuthenticated, getUserRole, logout } from "@/utils/auth";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Fixed stats mapping
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalPlans: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    totalSuccessAmount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!isAuthenticated()) {
          navigate("/auth");
          return;
        }

        const role = getUserRole();
        if (role !== "admin") navigate("/dashboard");

        const response = await apiService.getAdminStats();

        if (response.status) {
          const s = response.data.stats;

          setStats({
            totalUsers: s.totalClients,
            totalPosts: s.totalPosts,
            totalPlans: s.totalPlans,
            activeSubscriptions: s.activeSubscriptions,
            totalRevenue: Number(s.totalRevenue),
            totalSuccessAmount: Number(s.totalSuccessAmount),
          });
        }
      } catch (error: any) {
        if (error.message === "Authentication failed") {
          logout();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Failed to load admin stats",
            confirmButtonColor: "#6366f1",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-full min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered users",
      icon: Users,
      color: "text-indigo-600",
      format: (val: number) => val.toLocaleString(),
      onClick: () => navigate("/admin/users"),
      isClickable: true,
    },
    {
      title: "Total Posts",
      value: stats.totalPosts,
      description: "All posts created",
      icon: FileText,
      color: "text-amber-500",
      format: (val: number) => val.toLocaleString(),
      onClick: () => navigate("/admin/posts"),
      isClickable: true,
    },
    {
      title: "Active Subscriptions",
      value: stats.activeSubscriptions,
      description: "Paid subscribers",
      icon: CreditCard,
      color: "text-teal-600",
      format: (val: number) => val.toLocaleString(),
      onClick: () => navigate("/admin/subscriptions"),
      isClickable: true,
    },
    {
      title: "Total Revenue",
      value: stats.totalSuccessAmount,
      description: "Total successful plan subscriptions",
      icon: TrendingUp,
      color: "text-green-600",
      format: (val: number) => `₹${val.toLocaleString()}`,
      onClick: () => navigate("/admin/subscriptions"),
      isClickable: true,
    },
  ];

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
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
                Admin
              </span>{" "}
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              Manage users, plans, and monitor platform activity.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <Card
              key={index}
              className={`transition-transform duration-300 border border-gray-100 shadow-md ${
                card.isClickable
                  ? "cursor-pointer hover:shadow-xl hover:scale-[1.05]"
                  : "hover:shadow-xl hover:scale-[1.01]"
              }`}
              onClick={card.isClickable ? card.onClick : undefined}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-500">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-extrabold ${card.color}`}>
                  {card.format(card.value)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-lg border-2 border-indigo-100">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              Quick Management
            </CardTitle>
            <CardDescription>
              Direct links to key administrative sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-4 md:grid-cols-3">
              <Card
                className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 border-transparent hover:border-indigo-400/50 bg-indigo-50/50"
                onClick={() => navigate("/admin/users")}
              >
                <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                  <CardTitle className="text-base font-semibold text-gray-800">
                    Manage Users
                  </CardTitle>
                  <Users className="h-5 w-5 text-indigo-600" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">
                    View, edit, and suspend user accounts.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 border-transparent hover:border-teal-400/50 bg-teal-50/50"
                onClick={() => navigate("/admin/plans")}
              >
                <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                  <CardTitle className="text-base font-semibold text-gray-800">
                    Manage Plans
                  </CardTitle>
                  <Zap className="h-5 w-5 text-teal-600" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">
                    Create and edit subscription plans.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 border-transparent hover:border-cyan-400/50 bg-cyan-50/50"
                onClick={() => navigate("/admin/subscriptions")}
              >
                <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                  <CardTitle className="text-base font-semibold text-gray-800">
                    Subscriptions
                  </CardTitle>
                  <CreditCard className="h-5 w-5 text-cyan-600" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">
                    Track and view active user subscriptions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
