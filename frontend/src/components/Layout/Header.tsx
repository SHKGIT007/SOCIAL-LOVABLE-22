import { useState, useEffect, useRef } from "react";
import {
  Bell,
  LogOut,
  Trash2,
  Settings,
  User,
  X,
  Check,
  Zap,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, getUserRole } from "@/utils/auth";
import { apiService } from "@/services/api";
import { API_CONFIG } from "@/utils/config";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { formatDateTime } from "@/utils/dateFormatter";

import socket from "@/utils/socket";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export default function Header({
  isSidebarCollapsed,
  onToggleSidebar,
  isSidebarOpen = false,
  onToggleMobileMenu,
}: HeaderProps) {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["headerNotifications"],
    queryFn: async () => {
      return apiService.request(API_CONFIG.ENDPOINTS.NOTIFICATIONS.GET_ALL, {
        queryParams: { limit: 5 },
      });
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // Listen for real-time notifications to refetch header unread count
  useEffect(() => {
    const handleNotification = () => {
      refetch();
    };

    socket.on("receive_notification", handleNotification);

    return () => {
      socket.off("receive_notification", handleNotification);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data) {
      setNotifications(data.data?.notifications || []);
      setUnreadCount(data.data?.unreadCount || 0);
    }
  }, [data]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    if (isNotificationOpen || isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isNotificationOpen, isProfileOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiService.request(
        `${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ}/${notificationId}/read`,
        { method: "PUT" }
      );
      refetch();
    } catch (error) {
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.request(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
        {
          method: "PUT",
        }
      );
      refetch();
    } catch (error) {
    }
  };

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
      }
    });
  };


  const goToNotifications = () => {
    navigate(
      getUserRole() === "admin" ? "/admin/notifications" : "/notifications"
    );
    setIsNotificationOpen(false);
  };

  const goToProfile = () => {
    const role = getUserRole();
    if (role === "admin") {
      navigate("/admin/update-profile");
    } else {
      navigate("/update-profile");
    }
    setIsProfileOpen(false);
  };

  return (
    <header className="h-16 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Left Section - Logo and Menu/Collapse Buttons */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Mobile Menu Button - Mobile only */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden flex items-center justify-center p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6" />
            <span className="text-lg font-extrabold hidden sm:inline">
              SocialPost AI
            </span>
          </div>

          {/* Collapse Toggle Button - Desktop only */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSidebar();
            }}
            className="hidden lg:flex items-center justify-center p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Right Section - Notifications and Profile */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                const newOpenState = !isNotificationOpen;
                setIsNotificationOpen(newOpenState);
                setIsProfileOpen(false);
                if (newOpenState && unreadCount > 0) {
                  handleMarkAllAsRead();
                }
              }}
              className="relative p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 bg-white text-gray-800 rounded-lg shadow-2xl z-50 border border-gray-100 max-h-[70vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sticky top-0 bg-white rounded-t-lg">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification, idx) => (
                      <div
                        key={notification.id}
                        className={`border-b border-gray-100 p-3 hover:bg-gray-50 transition-colors ${!notification.is_read ? "bg-indigo-50" : ""
                          } ${idx === notifications.length - 1 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatDateTime(notification.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
                  <Button
                    onClick={goToNotifications}
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:opacity-90 transition-opacity text-sm"
                  >
                    View All
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationOpen(false);
              }}
              className="flex items-center gap-2 p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline text-sm font-medium truncate max-w-[100px]">
                {user?.email?.split("@")[0] || "User"}
              </span>
            </button>

            {/* Profile Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-72 bg-white text-gray-800 rounded-lg shadow-2xl z-50 border border-gray-100">
                {/* User Info */}
                <div className="border-b border-gray-200 p-4">
                  <p className="font-semibold text-gray-900 truncate">
                    {user?.email}
                  </p>
                  {/* <p className="text-xs text-indigo-600 capitalize mt-1">
                    {getUserRole()} Account
                  </p> */}
                </div>

                {/* Menu Items */}
                {["client", "admin"].includes(getUserRole() as string) && (
                  <div className="py-2">
                    <button
                      onClick={goToProfile}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                  </div>
                )}
                {/* Logout */}
                <div className="border-t border-gray-200 p-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
