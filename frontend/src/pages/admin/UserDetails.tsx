import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Swal from "sweetalert2";
import { ArrowLeft, Calendar, Mail, Phone, User, Zap, FileText } from "lucide-react";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getUserById(id);
      if (data.status === true) {
        setUser(data.data.user);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "User not found.",
          confirmButtonColor: "#6366f1",
        });
        navigate("/admin/users");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch user.",
        confirmButtonColor: "#6366f1",
      });
      navigate("/admin/users");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-full min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const subscriptions = user.Subscriptions || [];
  const posts = user.Posts || [];
  const activeSubscription = subscriptions.find((s: any) => s.status === "active");

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/users")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.user_fname} {user.user_lname}
            </h1>
            <p className="text-gray-500">User ID: {user.id}</p>
          </div>
        </div>

        {/* User Info Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{user.user_phone || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Member Since</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Status</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.active_status ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Active Subscription */}
        {activeSubscription && (
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-600" />
                Current Active Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 font-medium mb-1">Plan Name</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {activeSubscription.Plan?.name}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 font-medium mb-1">Price</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{activeSubscription.amount_paid}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 font-medium mb-1">AI Posts Quota</p>
                  <p className="text-sm font-semibold">
                    {activeSubscription.ai_posts_used} / {activeSubscription.Plan?.ai_posts}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{
                        width: `${
                          (activeSubscription.ai_posts_used / activeSubscription.Plan?.ai_posts) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 font-medium mb-1">Subscription Period</p>
                  <p className="text-xs text-gray-700">
                    {new Date(activeSubscription.start_date).toLocaleDateString()} -{" "}
                    {new Date(activeSubscription.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 pt-2">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 font-medium mb-1">Subscription Status</p>
                  <Badge className="bg-green-100 text-green-800">
                    {activeSubscription.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 font-medium mb-1">Payment Status</p>
                  <Badge
                    className={
                      activeSubscription.payment_status === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {activeSubscription.payment_status?.toUpperCase() || "N/A"}
                  </Badge>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 font-medium mb-1">Linked Accounts</p>
                  <p className="text-lg font-bold text-gray-900">
                    {activeSubscription.Plan?.linked_accounts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription History */}
        {subscriptions.length > 0 && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>All subscriptions for this user ({subscriptions.length} total)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-gray-200">
                      <TableHead className="font-bold">Plan</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">Start Date</TableHead>
                      <TableHead className="font-bold">End Date</TableHead>
                      <TableHead className="font-bold">AI Posts Used</TableHead>
                      <TableHead className="font-bold">Amount</TableHead>
                      <TableHead className="font-bold">Payment Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub: any) => (
                      <TableRow
                        key={sub.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          sub.status === "active" ? "bg-green-50" : ""
                        }`}
                      >
                        <TableCell className="font-medium">{sub.Plan?.name}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              sub.status === "active"
                                ? "bg-green-100 text-green-800"
                                : sub.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {sub.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(sub.start_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(sub.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-semibold text-indigo-600">
                          {sub.ai_posts_used} / {sub.Plan?.ai_posts}
                        </TableCell>
                        <TableCell className="font-bold text-green-600">₹{sub.amount_paid}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              sub.payment_status === "success"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {sub.payment_status?.toUpperCase() || "N/A"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts History */}
        {posts.length > 0 && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Posts History
              </CardTitle>
              <CardDescription>All posts created by this user ({posts.length} total)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-gray-200">
                      <TableHead className="font-bold">Created</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Title</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post: any) => (
                      <TableRow key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="text-sm text-gray-600">
                          {new Date(post.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge className={post.is_ai_generated ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-800"}>
                            {post.is_ai_generated ? "AI" : "Manual"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 truncate" title={post.title}>
                          {post.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              post.status === "published"
                                ? "bg-green-100 text-green-800"
                                : post.status === "scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {post.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data Messages */}
        {subscriptions.length === 0 && posts.length === 0 && (
          <Card className="border border-gray-200 shadow-sm text-center py-12">
            <CardContent>
              <p className="text-gray-500">No subscriptions or posts found for this user.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserDetails;
