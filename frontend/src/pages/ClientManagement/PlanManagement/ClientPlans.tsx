declare global {
  interface Window {
    Razorpay: any;
  }
}

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { TableColumn } from "react-data-table-component";
import { downloadExcel } from "@/utils/exportUtils";
import { formatDate } from "@/utils/dateFormatter";
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
import { Check, History, CreditCard, Calendar, ArrowRight, Clock, Zap, ShieldCheck, AlertCircle, Search, Download, RefreshCw, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import { isAuthenticated, logout } from "@/utils/auth";
import { Input } from "@/components/ui/input";

interface Plan {
  id: number;
  name: string;
  price: number;
  monthly_posts: number;
  ai_posts: number;
  linked_accounts: number;
  features?: any;
  description: string;
}

const ClientPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  const filteredHistory = useMemo(() => {
    return history.filter(item => 
      item.plan_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.Plan?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.status?.toLowerCase().includes(search.toLowerCase()) ||
      item.payment_status?.toLowerCase().includes(search.toLowerCase())
    );
  }, [history, search]);

  const exportHistory = () => {
    setExportLoading(true);
    try {
      const data = filteredHistory.map((sub, index) => ({
        "S.No": index + 1,
        Plan: sub.plan_name || sub.Plan?.name || "N/A",
        Amount: sub.amount_paid,
        Date: formatDate(sub.start_date),
        Status: sub.status,
        Payment: sub.payment_status || "SUCCESS"
      }));
      downloadExcel(data, "subscription-history", "History");
    } finally {
      setExportLoading(false);
    }
  };

  const columns: TableColumn<any>[] = [
    {
      name: "S.No",
      width: "70px",
      cell: (_, index) => index + 1,
    },
    {
      name: "Plan",
      selector: row => row.plan_name || row.Plan?.name || "Premium Plan",
      sortable: true,
      cell: row => (
        <span className="text-slate-900 font-bold">{row.plan_name || row.Plan?.name || "Premium Plan"}</span>
      )
    },
    {
      name: "Amount",
      selector: row => row.amount_paid,
      sortable: true,
      cell: row => <span className="font-semibold text-slate-700">₹{Math.floor(row.amount_paid)}</span>
    },
    {
      name: "Date",
      selector: row => row.start_date,
      sortable: true,
      cell: row => <span className="text-slate-500 text-sm">{formatDate(row.start_date)}</span>
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      cell: row => (
        <Badge 
          variant="outline"
          className={`${
            row.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            row.status === 'expired' ? 'bg-slate-100 text-slate-600 border-slate-200' :
            'bg-rose-50 text-rose-700 border-rose-200'
          } font-black text-[10px] uppercase px-3 py-1 rounded-full`}
        >
          {row.status}
        </Badge>
      )
    },
    {
      name: "Payment",
      selector: row => row.payment_status,
      cell: row => (
        <Badge 
          variant="secondary"
          className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5"
        >
          {row.payment_status?.toUpperCase() || "SUCCESS"}
        </Badge>
      )
    }
  ];

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

  const hasAnySubscription =
    currentSubscription && currentSubscription.status === "active";

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

      const historyResponse = await apiService.getMySubscriptionHistory();
      if (historyResponse.status) {
        setHistory(historyResponse.data.subscriptions || []);
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
    currentSubscription.ai_posts_used >= currentSubscription.ai_posts;

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
        html: `Are you sure you want to subscribe to <b>${plan.name}</b> for <b>₹${Math.floor(plan.price)}</b>?`,
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
        <div
          className="
    sticky top-0 z-10
    -mx-2 px-4 py-4
    bg-gradient-to-b from-white/90 to-white/70
    backdrop-blur
    border-b border-indigo-100
    flex flex-col sm:flex-row sm:items-center sm:justify-between
    gap-4
  "
        >
          <div>
            <h1 className="text-3xl font-extrabold">
              <span
                className={`text-transparent bg-clip-text ${primaryGradientClass}`}
              >
                Plans
              </span>{" "}
              Subscription
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              Choose a plan that fits your needs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-xl font-bold bg-white/50 border-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
        </div>

        {/* Subscription Insights */}
        {currentSubscription && (
          <Card className="overflow-hidden border-none shadow-xl bg-white rounded-2xl transition-all duration-300 hover:shadow-2xl">
            <div className={`h-2 ${currentSubscription.status === 'active' && !isPostLimitReached ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-orange-400'}`} />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-cyan-600 bg-clip-text text-transparent">
                    Subscription Insights
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium">
                    Overview of your current plan and usage
                  </CardDescription>
                </div>
                <Badge 
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                    currentSubscription.status === "active" && !isPostLimitReached
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-rose-100 text-rose-700 border-rose-200"
                  }`}
                  variant="outline"
                >
                  {isPostLimitReached ? "Limit Exhausted" : currentSubscription.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Plan Info */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4 transition-colors hover:bg-slate-100">
                  <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 shadow-sm">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Plan</p>
                    <h3 className="text-xl font-bold text-slate-800">{currentSubscription.plan_name || currentSubscription.Plan?.name}</h3>
                    <p className="text-sm font-semibold text-indigo-600">₹{Math.floor(currentSubscription.plan_price || currentSubscription.amount_paid)} / term</p>
                  </div>
                </div>

                {/* Date Info */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4 transition-colors hover:bg-slate-100">
                  <div className="p-3 rounded-xl bg-cyan-100 text-cyan-600 shadow-sm">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Activation Date</p>
                    <h3 className="text-lg font-bold text-slate-800">{formatDate(currentSubscription.start_date)}</h3>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> 
                      {currentSubscription.status === 'active' ? "Active now" : "Status: " + currentSubscription.status}
                    </p>
                  </div>
                </div>

                {/* Usage Stats (AI) */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center transition-colors hover:bg-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                       <Zap className={`h-5 w-5 ${isPostLimitReached ? 'text-rose-500' : 'text-amber-500'}`} />
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Credits Used</p>
                    </div>
                    <span className="text-sm font-black text-slate-700">
                      {currentSubscription.ai_posts_used} <span className="text-slate-400 font-medium">/ {currentSubscription.ai_posts}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        isPostLimitReached ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-gradient-to-r from-indigo-600 to-cyan-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          (currentSubscription.ai_posts_used / currentSubscription.ai_posts) * 100 || 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  {isPostLimitReached && (
                    <p className="text-[10px] font-bold text-rose-500 mt-2 flex items-center gap-1 animate-pulse">
                      <AlertCircle className="h-3 w-3" /> Upgrade plan to restore credits
                    </p>
                  )}
                </div>
              </div>

              {/* Status Message */}
              {isPostLimitReached && (
                <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-rose-200 text-rose-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-rose-800 font-semibold leading-snug">
                    Your AI post limit has been reached. Select a new plan below to continue generating amazing content without interruption.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {/* Plans */}
        {/* Show plans ONLY if no active subscription OR limit reached */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentSubscription?.plan_id === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden ${
                  isCurrent
                    ? "border-indigo-300 ring-1 ring-indigo-200"
                    : "border-indigo-100"
                }`}
              >
                {isCurrent && (
                  <div className="absolute right-0 top-3 rounded-s-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                    Current
                  </div>
                )}

                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">₹{Math.floor(plan.price)}</span>
                  </CardDescription>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Check className="h-4 w-4 text-indigo-600" />
                      <span>{plan.ai_posts} AI posts</span>
                    </div>
                    <div className="flex gap-2">
                      <Check className="h-4 w-4 text-indigo-600" />
                      <span>{plan.linked_accounts} linked accounts</span>
                    </div>
                  </div>
                </CardContent>

                {/* 🔥 BUTTON ONLY WHEN NO SUBSCRIPTION */}
                {!hasAnySubscription && (
                  <CardFooter>
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-bold"
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" /> Subscribe Now
                    </Button>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>

        {/* Subscription History */}
        {history.length > 0 && (
          <Card className="mt-12 border-indigo-100 shadow-lg overflow-hidden rounded-2xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <History className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Subscription History</CardTitle>
                    <CardDescription>Track your past plans and payment status</CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Search history..." 
                      className="pl-9 h-9 w-64 bg-white border-slate-200"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 border-slate-200 font-bold"
                    onClick={() => checkAuthAndFetchData()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="h-9 bg-emerald-600 hover:bg-emerald-700 font-bold"
                    onClick={exportHistory}
                    disabled={exportLoading}
                  >
                    <Download className="h-4 w-4 mr-2" /> {exportLoading ? "Exporting..." : "Export Excel"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-none overflow-hidden">
                <DataTable
                  columns={columns}
                  data={filteredHistory}
                  pagination
                  highlightOnHover
                  responsive
                  pointerOnHover
                  customStyles={{
                    rows: { 
                      style: { 
                        minHeight: "60px",
                        fontSize: "14px"
                      } 
                    },
                    headCells: {
                      style: {
                        background: "#f8fafc",
                        fontWeight: "700",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        padding: "16px",
                        color: "#64748b"
                      },
                    },
                    cells: {
                      style: { padding: "16px" },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientPlans;
