import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import { isAuthenticated, logout } from "@/utils/auth";

interface Plan {
  id: number;
  name: string;
  price: number;
  monthly_posts: number;
  ai_posts: number;
  linked_accounts: number;
  features: any;
}

const ClientPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      if (!isAuthenticated()) {
        navigate("/auth");
        return;
      }

      // Fetch active plans
      const plansResponse = await apiService.getActivePlans();
      if (plansResponse.status) {
        setPlans(plansResponse.data.plans || []);
      }

      // Fetch current subscription
      const subscriptionResponse = await apiService.getMySubscription();
      if (subscriptionResponse.status) {
        setCurrentSubscription(subscriptionResponse.data.subscription);
      }
    } catch (error: any) {
      if (error.message === 'Authentication failed') {
        logout();
      } else {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load plans data",
          confirmButtonColor: "#6366f1"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: number) => {
    try {
      setIsLoading(true);

      // Check if user already has active subscription
      if (currentSubscription) {
        Swal.fire({
          icon: "info",
          title: "Info",
          text: "You already have an active subscription. Please cancel it first.",
          confirmButtonColor: "#6366f1"
        });
        return;
      }

      // Create new subscription
      const response = await apiService.createSubscription({
        plan_id: planId,
        // start_date: new Date().toISOString(),
      });

      if (response.status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Successfully subscribed to the plan!",
          confirmButtonColor: "#6366f1"
        });
        await checkAuthAndFetchData();
      }
    } catch (error: any) {
      if (error.message === 'Authentication failed') {
        logout();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to subscribe to plan",
          confirmButtonColor: "#6366f1"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "Do you want to cancel your subscription?",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!"
    });
    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);

      const response = await apiService.cancelSubscription(currentSubscription.id);

      if (response.status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Subscription cancelled successfully",
          confirmButtonColor: "#6366f1"
        });
        await checkAuthAndFetchData();
      }
    } catch (error: any) {
      if (error.message === 'Authentication failed') {
        logout();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to cancel subscription",
          confirmButtonColor: "#6366f1"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Choose a plan that fits your needs
          </p>
        </div>

        {currentSubscription && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Your active plan details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Plan:</span>
                  <Badge>{currentSubscription.plans?.name}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Posts Used:</span>
                  <span>{currentSubscription.posts_used} / {currentSubscription.plans?.monthly_posts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">AI Posts Used:</span>
                  <span>{currentSubscription.ai_posts_used} / {currentSubscription.plans?.ai_posts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant="default">{currentSubscription.status}</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={isLoading}
              >
                Cancel Subscription
              </Button>
            </CardFooter>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={currentSubscription?.plan_id === plan.id ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{plan.monthly_posts} posts per month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{plan.ai_posts} AI-generated posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{plan.linked_accounts} linked social accounts</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading || currentSubscription?.plan_id === plan.id || !!currentSubscription}
                >
                  {currentSubscription?.plan_id === plan.id
                    ? "Current Plan"
                    : currentSubscription
                    ? "Cancel current plan first"
                    : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientPlans;
