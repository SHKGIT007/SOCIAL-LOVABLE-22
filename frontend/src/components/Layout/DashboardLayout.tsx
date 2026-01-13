import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getCurrentUser,
  getUserRole,
  isAuthenticated,
  logout,
  onAuthStateChange,
} from "@/utils/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Users,
  FileText,
  BadgeDollarSign,
  CreditCard,
  Settings,
  SlidersHorizontal,
  FileChartColumn,
  Zap,
  LogOut,
  X,
  Menu,
  Trash2,
  Bell,
} from "lucide-react";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import Header from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: "admin" | "client";
}

const DashboardLayout = ({ children, userRole }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile menu - false by default
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapse - false by default (expanded)
  const [user, setUser] = useState(getCurrentUser());

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/auth");
    } else {
      setUser(getCurrentUser());
    }
    const cleanup = onAuthStateChange((authData) => {
      if (!authData || !authData.token) {
        navigate("/auth");
      } else {
        setUser(authData.user);
      }
    });
    return cleanup;
  }, [navigate]);

  const handleSignOut = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366F1",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/auth");

        Swal.fire({
          title: "Logged Out",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleDeleteAccount = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Delete My Account",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const currentUser = getCurrentUser();

          if (!currentUser?.id) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "User ID not found.",
            });
            return;
          }

          await apiService.deleteMyAccount();

          logout();
          navigate("/auth");

          Swal.fire({
            title: "Account Deleted",
            text: "Your account has been permanently deleted.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: "Something went wrong while deleting your account.",
            icon: "error",
          });
        }
      }
    });
  };

  const menuItems =
    userRole === "admin"
      ? [
          { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
          { icon: Users, label: "Users", path: "/admin/users" },
          { icon: FileText, label: "Posts", path: "/admin/posts" },
          { icon: BadgeDollarSign, label: "Plans", path: "/admin/plans" },
          {
            icon: CreditCard,
            label: "Subscriptions",
            path: "/admin/subscriptions",
          },
          {
            icon: SlidersHorizontal,
            label: "System Settings",
            path: "/admin/system-settings",
          },
          { icon: FileChartColumn, label: "Report", path: "/admin/report" },
          // { icon: Bell, label: "Notifications", path: "/admin/notifications" },
        ]
      : [
          { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
          { icon: FileText, label: "Posts", path: "/posts" },
          { icon: Zap, label: "Auto Post Schedules", path: "/schedules" },
          { icon: Settings, label: "Plans", path: "/plans" },
          {
            icon: Settings,
            label: "Social Accounts",
            path: "/social-accounts",
          },
          { icon: Settings, label: "Post Setting", path: "/profile" },
          { icon: Settings, label: "My Profile", path: "/update-profile" },
          // { icon: Bell, label: "Notifications", path: "/notifications" },
        ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarOpen={isSidebarOpen}
          onToggleMobileMenu={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Fixed Sidebar - Visible on lg, toggle on mobile */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out shadow-lg z-40 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        } ${isSidebarOpen ? "block" : "hidden"} lg:block`}
      >
        <div className="flex h-full flex-col">
          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full transition-all duration-200 ${
                    isSidebarCollapsed
                      ? "justify-center px-2"
                      : "justify-start px-3"
                  } ${
                    isActive
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                  title={isSidebarCollapsed ? item.label : ""}
                  onClick={() => {
                    navigate(item.path);
                    if (isSidebarOpen) setIsSidebarOpen(false);
                  }}
                >
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 ${
                      !isSidebarCollapsed ? "mr-3" : ""
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-gray-100 p-3">
            {/* <Button
              variant="outline"
              className={`w-full border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-colors ${
                isSidebarCollapsed ? "p-2" : ""
              }`}
              onClick={handleSignOut}
              title={isSidebarCollapsed ? "Sign Out" : ""}
            >
              {isSidebarCollapsed ? (
                <LogOut className="h-4 w-4" />
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </>
              )}
            </Button> */}

            {/* {getUserRole() === "client" && (
              <Button
                variant="destructive"
                className={`w-full mt-3 border-2 border-red-300 text-red-600 transition-colors ${
                  isSidebarCollapsed ? "p-2" : ""
                }`}
                onClick={handleDeleteAccount}
                title={isSidebarCollapsed ? "Delete" : ""}
              >
                {isSidebarCollapsed ? (
                  <Trash2 className="h-4 w-4" />
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </>
                )}
              </Button>
            )} */}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 overflow-hidden ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <div className="h-[calc(100vh-64px)] overflow-y-auto pt-16 pb-8 px-4 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden mt-16"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
