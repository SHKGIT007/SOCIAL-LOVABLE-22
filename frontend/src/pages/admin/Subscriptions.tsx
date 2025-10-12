import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionData {
  id: string;
  user_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  posts_used: number;
  ai_posts_used: number;
  profile: {
    email: string;
    full_name: string | null;
  };
  plan: {
    name: string;
    price: number;
    monthly_posts: number;
    ai_posts: number;
  } | null;
}

const Subscriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAndFetchSubscriptions();
  }, []);

  const checkAdminAndFetchSubscriptions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData?.role !== "admin") {
        navigate("/dashboard");
        return;
      }

      await fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        profiles!subscriptions_user_id_fkey (
          email,
          full_name
        ),
        plans (
          name,
          price,
          monthly_posts,
          ai_posts
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSubscriptions(data as any || []);
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
          <p className="text-muted-foreground">Monitor all user subscriptions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
            <CardDescription>View and manage user subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posts Used</TableHead>
                  <TableHead>AI Posts Used</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sub.profile?.full_name || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">{sub.profile?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sub.plan?.name || "No plan"}</div>
                        {sub.plan && (
                          <div className="text-sm text-muted-foreground">${sub.plan.price}/month</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sub.status === "active"
                            ? "default"
                            : sub.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.posts_used} / {sub.plan?.monthly_posts || 0}
                    </TableCell>
                    <TableCell>
                      {sub.ai_posts_used} / {sub.plan?.ai_posts || 0}
                    </TableCell>
                    <TableCell>{new Date(sub.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "N/A"}
                    </TableCell>
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
