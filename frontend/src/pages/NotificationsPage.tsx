import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { API_CONFIG } from "@/utils/config";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { isAuthenticated, getUserRole } from "@/utils/auth";

import socket from "@/utils/socket";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  useEffect(() => {
    if (!isAuthenticated()) return navigate("/auth");
  }, [navigate]);

  // Fetch notifications
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications", currentPage, filter],
    queryFn: async () => {
      const queryParams: any = {
        page: currentPage,
        limit: 10,
      };

      if (filter !== "all") {
        queryParams.is_read = filter === "read" ? "true" : "false";
      }

      return apiService.request(API_CONFIG.ENDPOINTS.NOTIFICATIONS.GET_ALL, {
        queryParams,
      });
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // Fetch unread count & Listen for real-time notifications
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await apiService.request(
          API_CONFIG.ENDPOINTS.NOTIFICATIONS.GET_UNREAD_COUNT
        );
        setUnreadCount(response.data?.unreadCount || 0);
      } catch (error) {
      }
    };

    fetchUnreadCount();

    // Listen for new notifications to refetch
    const handleNotification = () => {
      refetch();
      fetchUnreadCount();
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

  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiService.request(
        `${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ}/${notificationId}/read`,
        { method: "PUT" }
      );
      refetch();
    } catch (error) {
      Swal.fire("Error", "Failed to mark notification as read", "error");
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
      Swal.fire("Success", "All notifications marked as read", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to mark notifications as read", "error");
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      user_registered: "👤",
      plan_purchase: "💳",
      post_created: "✏️",
      post_published: "📤",
      post_scheduled: "📅",
      post_pending_review: "⏳",
      post_draft: "📝",
      ai_limit_alert: "⚠️",
      schedule_reminder: "🔔",
      draft_reminder: "📌",
    };
    return icons[type] || "📢";
  };

  const getNotificationColor = (type) => {
    const colors = {
      user_registered: "bg-blue-50",
      plan_purchase: "bg-green-50",
      post_created: "bg-purple-50",
      post_published: "bg-green-50",
      post_scheduled: "bg-yellow-50",
      post_pending_review: "bg-orange-50",
      post_draft: "bg-gray-50",
      ai_limit_alert: "bg-red-50",
      schedule_reminder: "bg-blue-50",
      draft_reminder: "bg-gray-50",
    };
    return colors[type] || "bg-gray-50";
  };

  const getNotificationBadgeColor = (type) => {
    const badgeColors = {
      user_registered: "bg-blue-100 text-blue-700 border-blue-300",
      plan_purchase: "bg-green-100 text-green-700 border-green-300",
      post_created: "bg-purple-100 text-purple-700 border-purple-300",
      post_published: "bg-green-100 text-green-700 border-green-300",
      post_scheduled: "bg-yellow-100 text-yellow-700 border-yellow-300",
      post_pending_review: "bg-orange-100 text-orange-700 border-orange-300",
      post_draft: "bg-gray-100 text-gray-700 border-gray-300",
      ai_limit_alert: "bg-red-100 text-red-700 border-red-300",
      schedule_reminder: "bg-blue-100 text-blue-700 border-blue-300",
      draft_reminder: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return badgeColors[type] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole={getUserRole() as any}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={getUserRole() as any}>
      <div className="space-y-8">
        {/* Header */}
        <div className="sticky top-0 z-10 -mx-2 px-4 py-4 bg-gradient-to-b from-white/90 to-white/70 backdrop-blur border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">
              <span
                className={`text-transparent bg-clip-text ${primaryGradientClass}`}
              >
                Notifications
              </span>
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""
                }`
                : "All notifications read"}
            </p>
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

        {/* Filters + Table Card */}
        <Card className="shadow-xl border border-indigo-100 rounded-2xl">
          <CardContent className="pt-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setFilter("all");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition ${filter === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setFilter("unread");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition ${filter === "unread"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => {
                    setFilter("read");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition ${filter === "read"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Read
                </button>
              </div>

              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark All as Read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-base font-medium">
                    {filter === "unread"
                      ? "No unread notifications"
                      : filter === "read"
                        ? "No read notifications"
                        : "No notifications"}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Your notifications will appear here
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-l-4 p-3 rounded-lg shadow-sm hover:shadow transition ${getNotificationColor(
                      notification.notification_type
                    )} ${!notification.is_read
                      ? "border-l-indigo-600 bg-indigo-50/50"
                      : "border-l-gray-300"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl mt-0.5 flex-shrink-0">
                          {getNotificationIcon(notification.notification_type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-sm">
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <span className="inline-block h-1.5 w-1.5 bg-indigo-600 rounded-full"></span>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize font-semibold ${getNotificationBadgeColor(
                                notification.notification_type
                              )}`}
                            >
                              {notification.notification_type.replace(
                                /_/g,
                                " "
                              )}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mt-1 text-xs leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(
                              notification.created_at
                            ).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(
                              notification.created_at
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1.5 hover:bg-indigo-200 rounded-lg transition"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-indigo-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {data?.data?.pagination && data.data.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border bg-white hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Page{" "}
                    <span className="text-indigo-600 font-bold">
                      {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="text-indigo-600 font-bold">
                      {data.data.pagination.totalPages}
                    </span>
                  </span>
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(data.data.pagination.totalPages, currentPage + 1)
                    )
                  }
                  disabled={currentPage === data.data.pagination.totalPages}
                  className="px-4 py-2 rounded-lg border bg-white hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  Next →
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
