import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";

interface SubscriptionData {
  id: string;
  user_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  posts_used: number;
  ai_posts_used: number;
  payment_status: string;
  User?: {
    email: string;
    user_name: string | null;
  };
  Plan: {
    name: string;
    price: number;
    monthly_posts: number;
    ai_posts: number;
    linked_accounts: number;
  } | null;
}

const Subscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAndFetchSubscriptions();
  }, []);

  const checkAdminAndFetchSubscriptions = async () => {
    try {
      if (!isAuthenticated()) {
        navigate("/auth");
        return;
      }
      if (!isAdmin()) {
        navigate("/dashboard");
        return;
      }
      await fetchSubscriptions();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const data = await apiService.getAllSubscriptions();
      if (data.status === true) {
        setSubscriptions(data?.data?.subscriptions || []);
      } else {
        setSubscriptions([]);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to fetch subscriptions.",
          confirmButtonColor: "#6366f1",
        });
        return;
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch subscriptions.",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Monitor all user subscriptions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
            <CardDescription>
              View and manage user subscription details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead>Posts Used</TableHead> */}
                  <TableHead>AI Posts Used</TableHead>
                  <TableHead>Linked Accounts</TableHead>
                  <TableHead>Start Date</TableHead>
                  {/* <TableHead>End Date</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions?.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {sub?.User?.user_name || "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {sub?.User?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {sub.Plan?.name || "N/A"}
                        </div>
                        {sub.Plan && (
                          <div className="text-sm text-muted-foreground">
                            {sub.Plan.price}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>{sub.payment_status}</Badge>
                    </TableCell>
                    {/* <TableCell>
  {sub.posts_used} / {sub.Plan?.monthly_posts || 0}
</TableCell> */}

                    <TableCell>
                      {sub.ai_posts_used} / {sub.Plan?.ai_posts || 0}
                    </TableCell>
                    <TableCell>{sub.Plan?.linked_accounts}</TableCell>
                    <TableCell>
                      {new Date(sub.start_date).toLocaleDateString()}
                    </TableCell>
                    {/* <TableCell>
                      {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "N/A"}
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Subscriptions;
