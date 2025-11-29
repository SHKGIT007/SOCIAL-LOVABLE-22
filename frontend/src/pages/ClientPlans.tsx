declare global {
  interface Window {
    Razorpay: any;
  }
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  features?: any;
  description: string;
  duration_months: number;
}

const ClientPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    checkAuthAndFetchData();

    return () => {
      document.body.removeChild(script);
    };
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
      } else {
        setCurrentSubscription(null);
      }
    } catch (error: any) {
      if (error.message === "Authentication failed") {
        logout();
      } else {
        Swal.fire("Error", "Failed to load plans", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startRazorpayPayment = async (plan: Plan) => {
    try {
      const orderResponse = await apiService.createRazorpayOrder({
        plan_id: plan.id,
      });

      if (!orderResponse.status) {
        Swal.fire("Error", "Failed to create Razorpay order", "error");
        return;
      }

      const { order_id, amount, currency, key } = orderResponse.data;

      const options = {
        key,
        amount,
        currency,
        name: "SocialVibe",
        description: `Subscription - ${plan.name}`,
        order_id,
        handler: async function (response: any) {
          const verify = await apiService.verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan_id: plan.id,
          });

          if (verify.status) {
            Swal.fire("Success", "Subscription Activated!", "success");
            checkAuthAndFetchData();
          } else {
            Swal.fire("Error", verify.message || "Payment failed", "error");
          }
        },
        modal: {
          ondismiss: () => {
            Swal.fire("Cancelled", "Payment cancelled", "info");
          },
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      Swal.fire("Error", "Unable to start payment", "error");
    }
  };

  // 🔥 Check if AI posts limit reached
  const isPostLimitReached =
    currentSubscription &&
    currentSubscription.ai_posts_used >= currentSubscription.Plan?.ai_posts;

  const hasActiveSubscription =
    currentSubscription &&
    currentSubscription.status === "active" &&
    !isPostLimitReached;

  const handleSubscribe = async (planId: number) => {
    try {
      if (hasActiveSubscription) {
        Swal.fire(
          "Info",
          "You already have an active subscription. Please cancel it first.",
          "info"
        );
        return;
      }

      const plan = plans.find((p) => p.id === planId);
      if (!plan) return;

      const result = await Swal.fire({
        title: "Confirm Subscription",
        html: `Are you sure you want to subscribe to <b>${plan.name}</b> for <b>₹${plan.price}</b>?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Continue",
        cancelButtonText: "No, Cancel",
        confirmButtonColor: "#6366f1",
      });

      if (!result.isConfirmed) return;

      const planPrice = Number(plan.price) || 0;
      if (planPrice <= 0) {
        const freeResponse = await apiService.createSubscription({
          plan_id: plan.id,
        });
        if (freeResponse.status) {
          Swal.fire("Success", "Subscription Activated!", "success");
          checkAuthAndFetchData();
        } else {
          Swal.fire(
            "Error",
            freeResponse.message || "Failed to activate plan",
            "error"
          );
        }
        return;
      }

      startRazorpayPayment(plan);
    } catch (e: any) {
      Swal.fire("Error", e.message || "Failed to subscribe", "error");
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
        <div>
          <h1 className="flex items-baseline gap-2 text-3xl font-extrabold">
            <span className="bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">
              Subscription
            </span>
            <span className="text-gray-900"> Plans</span>
          </h1>
          <p className="text-muted-foreground">
            Choose a plan that fits your needs
          </p>
        </div>
        {/* Current Subscription */}
        {currentSubscription && (
          <Card className="border-indigo-200 shadow-sm">
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Plan Name:</span>
                  <Badge>{currentSubscription.Plan?.name}</Badge>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Amount Paid:</span>
                  <span className="font-semibold">
                    ₹{currentSubscription.amount_paid}
                  </span>
                </div>

                {/* 🔥 Display Start & End Date */}
                <div className="flex justify-between">
                  <span className="font-medium">Start Date:</span>
                  <span>
                    {new Date(
                      currentSubscription.start_date
                    ).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">End Date:</span>
                  <span>
                    {currentSubscription.end_date
                      ? new Date(
                          currentSubscription.end_date
                        ).toLocaleDateString("en-IN")
                      : "No End Date"}
                  </span>
                </div>

                {/* 🔥 AI Posts with Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">AI Posts Used:</span>
                    <span>
                      {currentSubscription.ai_posts_used} /{" "}
                      {currentSubscription.Plan?.ai_posts}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPostLimitReached ? "bg-red-500" : "bg-indigo-600"
                      }`}
                      style={{
                        width: `${Math.min(
                          (currentSubscription.ai_posts_used /
                            currentSubscription.Plan?.ai_posts) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge
                    style={{
                      backgroundColor: isPostLimitReached
                        ? "red"
                        : hasActiveSubscription
                        ? "green"
                        : "gray",
                    }}
                  >
                    {isPostLimitReached
                      ? "Limit Reached"
                      : hasActiveSubscription
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>

                {/* Warning when limit reached */}
                {isPostLimitReached && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      ⚠️ Your AI post limit has been reached. Please subscribe
                      to a new plan to continue creating AI posts.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentSubscription?.plan_id === plan.id;
            const buttonDisabled = hasActiveSubscription;
            const buttonLabel = (() => {
              if (isCurrent && hasActiveSubscription) return "Current Plan";
              if (hasActiveSubscription) return "Cancel current plan first";
              if (isCurrent && isPostLimitReached) return "Renew Plan";
              return "Subscribe";
            })();

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  isCurrent
                    ? "border-indigo-300 ring-1 ring-indigo-200"
                    : "border-indigo-100"
                }`}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-600 to-sky-500" />

                {isCurrent && (
                  <div className="absolute right-0 top-3 -translate-y-1/2 rounded-s-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow">
                    Current
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-extrabold text-gray-900">
                      ₹{plan.price}
                    </span>
                  </CardDescription>
                  <CardDescription>
                    <span className="text-l font-bold text-gray-900">
                      {plan.description}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardDescription className="px-6">
                  <span className="text-sm text-gray-600">
                    {plan.duration_months} months duration
                  </span>
                </CardDescription>

                <CardContent>
                  <div className="space-y-2 text-gray-800">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-indigo-600" />
                      <span>{plan.ai_posts} AI-generated posts</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-indigo-600" />
                      <span>{plan.linked_accounts} linked accounts</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full shadow-md ${
                      buttonDisabled
                        ? "bg-gray-200 text-gray-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-sky-500 text-white"
                    }`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={buttonDisabled}
                  >
                    {buttonLabel}
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
