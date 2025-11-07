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

      const plansResponse = await apiService.getActivePlans();
      if (plansResponse.status) {
        setPlans(plansResponse.data.plans || []);
      }

      const subscriptionResponse = await apiService.getMySubscription();
      if (subscriptionResponse.status) {
        setCurrentSubscription(subscriptionResponse.data.subscription);
      }
    } catch (error: any) {
      if (error.message === "Authentication failed") {
        logout();
      } else {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load plans data",
          confirmButtonColor: "#6366f1",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: number) => {
    try {
      setIsLoading(true);

      if (currentSubscription) {
        Swal.fire({
          icon: "info",
          title: "Info",
          text: "You already have an active subscription. Please cancel it first.",
          confirmButtonColor: "#6366f1",
        });
        return;
      }

      const response = await apiService.createSubscription({
        plan_id: planId,
        start_date: new Date().toISOString(),
      });

      if (response.status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Successfully subscribed to the plan!",
          confirmButtonColor: "#6366f1",
        });
        await checkAuthAndFetchData();
      }
    } catch (error: any) {
      if (error.message === "Authentication failed") {
        logout();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to subscribe to plan",
          confirmButtonColor: "#6366f1",
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
      confirmButtonText: "Yes, cancel it!",
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
          confirmButtonColor: "#6366f1",
        });
        await checkAuthAndFetchData();
      }
    } catch (error: any) {
      if (error.message === "Authentication failed") {
        logout();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to cancel subscription",
          confirmButtonColor: "#6366f1",
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-8">
        {/* Header with gradient kicker for consistency */}
        <div>
          <h1 className="flex items-baseline gap-2 text-3xl font-extrabold">
            <span className="bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">Subscription</span>
            <span className="text-gray-900"> Plans</span>
          </h1>
          <p className="text-muted-foreground">Choose a plan that fits your needs</p>
        </div>

        {/* Current Subscription card */}
        {currentSubscription && (
          <Card className="border-indigo-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-800">Current Subscription</CardTitle>
              <CardDescription>Your active plan details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
                  <span className="font-medium text-gray-700">Plan</span>
                  <Badge variant="secondary" className="capitalize">
                    {currentSubscription.plans?.name}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
                  <span className="font-medium text-gray-700">Status</span>
                  <Badge variant="default" className="capitalize">
                    {currentSubscription.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
                  <span className="font-medium text-gray-700">Posts Used</span>
                  <span className="text-gray-800">
                    {currentSubscription.posts_used} / {currentSubscription.plans?.monthly_posts}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
                  <span className="font-medium text-gray-700">AI Posts Used</span>
                  <span className="text-gray-800">
                    {currentSubscription.ai_posts_used} / {currentSubscription.plans?.ai_posts}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className="shadow-sm"
              >
                Cancel Subscription
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Plans grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentSubscription?.plan_id === plan.id;
            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  isCurrent ? "border-indigo-300 ring-1 ring-indigo-200" : "border-indigo-100"
                }`}
              >
                {/* Top accent bar */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-600 to-sky-500" />

                {/* Ribbon for current plan */}
                {isCurrent && (
                  <div className="absolute right-0 top-3 -translate-y-1/2 rounded-s-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow">
                    Current
                  </div>
                )}

                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-extrabold text-gray-900">${plan.price}</span>
                    <span className="text-muted-foreground"> / month</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  <div className="space-y-2 text-gray-800">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-indigo-600" />
                      <span>{plan.monthly_posts} posts per month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-indigo-600" />
                      <span>{plan.ai_posts} AI-generated posts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-indigo-600" />
                      <span>{plan.linked_accounts} linked social accounts</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full shadow-md ${
                      isCurrent
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-200 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white"
                    }`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading || isCurrent || !!currentSubscription}
                  >
                    {isCurrent
                      ? "Current Plan"
                      : currentSubscription
                      ? "Cancel current plan first"
                      : "Subscribe"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientPlans;
