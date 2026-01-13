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
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Calendar, TrendingUp } from "lucide-react";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import { isAuthenticated, getUserRole, logout } from "@/utils/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  // State variables are preserved
  const [userRole, setUserRole] = useState<"admin" | "client">("client");
  const [stats, setStats] = useState({
    totalPosts: 0,
    aiPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Define the primary gradient class for theme consistency
  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  // --- Logic is preserved ---
  useEffect(() => {
    const checkUserAndFetchStats = async () => {
      try {
        // Authentication Check (Preserved)
        if (!isAuthenticated()) {
          navigate("/auth");
          return;
        }

        const role = getUserRole();
        setUserRole(role as "admin" | "client");

        // Admin Redirect (Preserved)
        if (role === "admin") {
          navigate("/admin");
          return;
        }

        // Fetch user stats (Preserved)
        const response = await apiService.getUserStats();

        if (response.status) {
          setStats(response.data.stats);
        }
      } catch (error: any) {
        // Error handling (Preserved)
        if (error.message === "Authentication failed") {
          logout();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Failed to load dashboard data",
            confirmButtonColor: "#6366f1",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndFetchStats();
  }, [navigate]);
  // -------------------------

  // Loading State (Preserved and styled)
  if (isLoading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-full min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }
  


  // Define the stat cards array with distinct colors/icons
  const statCards = [
    {
      title: "Total Posts",
      value: stats.totalPosts,
      description: "All your posts",
      icon: FileText,
      color: "text-gray-600",
      route: "/posts",
      state:"",
    },
    {
      title: "AI Generated",
      value: stats.aiPosts,
      description: "Posts created by AI",
      icon: Sparkles,
      color: "text-indigo-600", // Indigo for AI/Smart features
        route: "/posts",
      state:"AI Generated",
    },
    {
      title: "Scheduled",
      value: stats.scheduledPosts,
      description: "Waiting to publish",
      icon: Calendar,
      color: "text-amber-500", // Amber for pending tasks
      route: "/posts",
      state:"Scheduled",
    },
    {
      title: "Published",
      value: stats.publishedPosts,
      description: "Live posts",
      icon: TrendingUp,
      color: "text-cyan-500", // Cyan for success/live data
      route: "/posts",
      state:"Published",
    },
  ];

const handleRoute = (route, state) => {
  navigate(route, {
    state: {
      filter: state, 
    },
  });
};

  return (
    // Applied light theme background to the main content area
    <DashboardLayout userRole={userRole}>
      <div className="space-y-8 ">
      

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
                AI
              </span>{" "}
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg mt-1">
             Welcome back! Here's an overview of your social media activity and
            performance.
            </p>
          </div>
        </div>



        {/* --- */}

        {/* Stats Grid: Clean Card Styling */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <Card
              key={index}
              // Theme: subtle hover and clean shadow
              className="transition-transform duration-300 hover:shadow-xl hover:scale-[1.02] border border-gray-100 shadow-md"
            onClick={() => handleRoute(card.route, card.state)}
           >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-500">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-gray-900">
                  {card.value}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* --- */}

        {/* Action and Activity Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Actions Card */}
          <Card className="shadow-lg border-2 border-indigo-100">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">
                Quick Actions
              </CardTitle>
              <CardDescription>
                Instantly jump into your most common tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary Action Button: Uses the consistent gradient and shadow */}
              <Button
                className={`w-full justify-start text-lg font-semibold py-6 shadow-lg shadow-indigo-500/30 ${primaryGradientClass}`}
                onClick={() => navigate("/posts/new")}
              >
                <Sparkles className="mr-3 h-5 w-5 animate-pulse" />
                Create New Post (AI or Manual)
              </Button>
              {/* Secondary Action Button: Clean outline with indigo accent */}
              <Button
                variant="outline"
                className="w-full justify-start text-lg py-6 border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                onClick={() => navigate("/posts")}
              >
                <FileText className="mr-3 h-5 w-5" />
                View All Posts
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">
                Activity Overview
              </CardTitle>
              <CardDescription>
                What's next for your social strategy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base text-gray-700">
                {stats.scheduledPosts > 0 ? (
                  // FIX: Wrap the <span> and the plain text in a React Fragment <>...</>
                  <>
                    <span className="text-indigo-600 font-semibold">
                      You have {stats.scheduledPosts} posts scheduled!
                    </span>{" "}
                    Check the calendar to review them.
                  </>
                ) : stats.totalPosts === 0 ? (
                  "No posts yet. Use the 'Generate AI Post' button to create your first content!"
                ) : (
                  "Start creating more engaging content with AI assistance."
                )}
              </p>
              {/* Added a prompt for Analytics for better feature visibility */}
              <div className="mt-4">
                <Button
                  variant="link"
                  className="p-0 text-cyan-600"
                  onClick={() => navigate("/posts")}
                >
                  <TrendingUp className="mr-2 h-4 w-4" /> View detailed
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
