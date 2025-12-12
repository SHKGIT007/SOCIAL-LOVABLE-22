import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  User,
  Zap,
  FileText,
} from "lucide-react";

// Format date to IST
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
  const [planHistory, setPlanHistory] = useState<any[]>([]);
  const [postHistory, setPostHistory] = useState<any[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
    fetchPlanHistory();
    fetchPostHistory();
  }, [id]);

  // FETCH USER DETAILS
  const fetchUserDetails = async () => {
    try {
      const res = await apiService.getUserById(id);
      if (res.status === true) {
        setUser(res.data.user);
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

  // FETCH SUBSCRIPTION HISTORY
  const fetchPlanHistory = async () => {
    try {
      const res = await apiService.getUserPlanHistory(id);

      if (res.status === true) {
        const items = res.data?.subscriptions || [];

        setPlanHistory(items);

        const active = items.find((p: any) => p.status === "active");
        setActiveSubscription(active || null);
      }
    } catch (err) {
      console.log("Plan history error:", err);
    }
  };

  // FETCH POST HISTORY
  const fetchPostHistory = async () => {
    try {
      const res = await apiService.getUserPostHistory(id);

      if (res.status === true) {
        const items = res.data?.posts || [];
        setPostHistory(items);
      }
    } catch (err) {
      console.log("Post history error:", err);
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
      <div className="space-y-8 p-6">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/users")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{user.user_name}</h1>
        </div>

        {/* USER BASIC INFO */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex gap-3 items-center">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex gap-3 items-center">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-semibold">{user.user_phone || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex gap-3 items-center">
              <Calendar className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="font-semibold">
                  {formatDateTime(user.created_at)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex gap-3 items-center">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-semibold">
                  {user.active_status ? "Active" : "Inactive"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ACTIVE SUBSCRIPTION */}
        {activeSubscription ? (
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-600" /> Active Subscription
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500">Plan</p>
                  <p className="font-bold text-indigo-600">
                    {activeSubscription.Plan?.name}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="font-bold text-green-600">
                    ₹{activeSubscription.amount_paid}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p>{formatDateTime(activeSubscription.start_date)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500">End Date</p>
                  <p>{formatDateTime(activeSubscription.end_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-6 text-center border-red-300 bg-red-50">
            <p className="text-red-700 font-semibold">No Active Subscription</p>
          </Card>
        )}

        {/* SUBSCRIPTION HISTORY TABLE */}
        {planHistory.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {planHistory.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.Plan?.name}</TableCell>
                      <TableCell>
                        <Badge>{sub.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(sub.start_date)}</TableCell>
                      <TableCell>{formatDateTime(sub.end_date)}</TableCell>
                      <TableCell>₹{sub.amount_paid}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-6 text-center border-gray-300 bg-gray-50">
            <p className="text-gray-700 font-medium">
              No Subscription History Found
            </p>
          </Card>
        )}

        {/* POST HISTORY */}
        {postHistory.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Posts Generated
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {postHistory.map((post: any) => (
                    <TableRow key={post.id}>
                      <TableCell>{post.title}</TableCell>
                      <TableCell>
                        <Badge>{post.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(post.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-6 text-center border-yellow-300 bg-yellow-50">
            <p className="text-yellow-700 font-medium">
              No Posts Generated Yet
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserDetails;
