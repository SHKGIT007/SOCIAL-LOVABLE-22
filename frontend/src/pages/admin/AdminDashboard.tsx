import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CreditCard, TrendingUp, Zap } from "lucide-react"; // Added Zap for flair
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { isAuthenticated, getUserRole, logout } from "@/utils/auth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    activeSubscriptions: 0,
    totalRevenue: 0, // Assuming this is a number
  });
  const [isLoading, setIsLoading] = useState(true);

  // Define the primary gradient class for theme consistency
  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  // --- Logic is preserved ---
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!isAuthenticated()) {
          navigate("/auth");
          return;
        }

        const role = getUserRole();
        if (role !== "admin") {
          navigate("/dashboard");
          return;
        }

        // Fetch admin stats (Preserved)
        const response = await apiService.getAdminStats();
        
        if (response.status) {
          setStats(response.data.stats);
        }

      } catch (error: any) {
        if (error.message === 'Authentication failed') {
          logout();
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to load admin stats",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate, toast]);
  // -------------------------

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-full min-h-screen">
          {/* Loading spinner uses the primary color */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Define the stat cards with thematic colors and formatting
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered users",
      icon: Users,
      color: "text-indigo-600", // Indigo for user base
      format: (val: number) => val.toLocaleString(),
    },
    {
      title: "Total Posts",
      value: stats.totalPosts,
      description: "All posts created",
      icon: FileText,
      color: "text-amber-500", // Amber for content activity
      format: (val: number) => val.toLocaleString(),
    },
    {
      title: "Active Subscriptions",
      value: stats.activeSubscriptions,
      description: "Paid subscribers",
      icon: CreditCard,
      color: "text-teal-600", // Teal for stability/subscriptions
      format: (val: number) => val.toLocaleString(),
    },
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      description: "Total earnings",
      icon: TrendingUp,
      color: "text-cyan-600", // Cyan for growth/money
      format: (val: number) => `$${val.toLocaleString()}`, // Format as currency
    },
  ];

  return (
    <DashboardLayout userRole="admin">
      {/* Container background is white/light from the layout's main tag */}
      <div className="space-y-8">
        
        {/* Header Section (Themed) */}
        <div className="pb-4 border-b border-gray-100">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            <span className={`text-transparent bg-clip-text ${primaryGradientClass}`}>Admin</span> Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage users, plans, and monitor platform activity.
          </p>
        </div>

        {/* Stats Grid (Themed) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <Card key={index} className="transition-transform duration-300 hover:shadow-xl hover:scale-[1.01] border border-gray-100 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-500">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-extrabold ${card.color}`}>{card.format(card.value)}</div>
                <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions (Themed) */}
        <Card className="shadow-lg border-2 border-indigo-100">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Quick Management</CardTitle>
            <CardDescription>Direct links to key administrative sections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-4 md:grid-cols-3">
              
              {/* Manage Users Card */}
              <Card 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 border-transparent hover:border-indigo-400/50 bg-indigo-50/50" 
                onClick={() => navigate("/admin/users")}
              >
                <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                  <CardTitle className="text-base font-semibold text-gray-800">Manage Users</CardTitle>
                  <Users className="h-5 w-5 text-indigo-600" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">View, edit, and suspend user accounts.</p>
                </CardContent>
              </Card>

              {/* Manage Plans Card */}
              <Card 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 border-transparent hover:border-teal-400/50 bg-teal-50/50" 
                onClick={() => navigate("/admin/plans")}
              >
                <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                  <CardTitle className="text-base font-semibold text-gray-800">Manage Plans</CardTitle>
                  <Zap className="h-5 w-5 text-teal-600" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">Create and edit subscription plans.</p>
                </CardContent>
              </Card>

              {/* Subscriptions Card */}
              <Card 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 border-transparent hover:border-cyan-400/50 bg-cyan-50/50" 
                onClick={() => navigate("/admin/subscriptions")}
              >
                <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                  <CardTitle className="text-base font-semibold text-gray-800">Subscriptions</CardTitle>
                  <CreditCard className="h-5 w-5 text-cyan-600" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">Track and view active user subscriptions.</p>
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