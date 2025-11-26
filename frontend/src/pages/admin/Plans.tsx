import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

interface Plan {
  id: string;
  name: string;
  price: number;
  monthly_posts: number;
  ai_posts: number;
  linked_accounts: number;
  is_active: boolean;
  features: any;
  description: string;
  duration_months: number;
}

const Plans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    monthly_posts: 0,
    ai_posts: 0,
    linked_accounts: 0,
    is_active: false,
    description: "",
    duration_months: 0,
  });

  useEffect(() => {
    checkAdminAndFetchPlans();
  }, []);

  const checkAdminAndFetchPlans = async () => {
    try {
      if (!isAuthenticated()) {
        navigate("/auth");
        return;
      }
      if (!isAdmin()) {
        navigate("/dashboard");
        return;
      }
      await fetchPlans();
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

  const fetchPlans = async () => {
    try {
      const data = await apiService.getAllPlans();
      if (data.status === true) {
        setPlans(data?.data?.plans || []);
      } else {
        setPlans([]);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to fetch plans.",
          confirmButtonColor: "#6366f1",
        });
        return;
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch plans.",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  const handleStatusToggle = async (plan: Plan) => {
    const newStatus = plan.is_active ? "Inactive" : "Active";

    const result = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: `Do you want to set this plan as ${newStatus}?`,
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, make it ${newStatus}`,
    });

    if (!result.isConfirmed) return;

    try {
      await apiService.updatePlan(plan.id, {
        ...plan,
        is_active: plan.is_active ? 0 : 1,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Plan is now ${newStatus}`,
        confirmButtonColor: "#6366f1",
      });

      fetchPlans();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update status.",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      is_active: formData.is_active ? 1 : 0,
    };

    try {
      let actionText = editingPlan ? "update" : "create";

      // 🔥 Confirmation Before Create & Update BOTH
      const result = await Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: `Do you want to ${actionText} this plan?`,
        showCancelButton: true,
        confirmButtonColor: "#6366f1",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, ${actionText} it!`,
      });

      if (!result.isConfirmed) {
        setIsLoading(false);
        return;
      }

      // 🔵 UPDATE PLAN
      if (editingPlan) {
        await apiService.updatePlan(editingPlan.id, payload);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Plan updated successfully!",
          confirmButtonColor: "#6366f1",
        });
      }

      // 🟢 CREATE PLAN
      else {
        await apiService.createPlan(payload);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Plan created successfully!",
          confirmButtonColor: "#6366f1",
        });
      }

      setIsDialogOpen(false);
      setEditingPlan(null);

      setFormData({
        name: "",
        price: 0,
        monthly_posts: 0,
        ai_posts: 0,
        linked_accounts: 0,
        is_active: false,
        description: "",
        duration_months: 0,
      });

      await fetchPlans();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save plan.",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      monthly_posts: plan.monthly_posts,
      ai_posts: plan.ai_posts,
      linked_accounts: plan.linked_accounts,
      is_active: plan.is_active,
      description: plan.description || "",
      duration_months: plan.duration_months,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "Do you really want to delete this plan?",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiService.deletePlan(id);

      // 🔥 CHECK BACKEND STATUS
      if (response.status === false) {
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to delete plan.",
          confirmButtonColor: "#6366f1",
        });
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Plan deleted successfully!",
        confirmButtonColor: "#6366f1",
      });

      await fetchPlans();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to delete plan.",
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

  // console.log("Plans data: ", plans);

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Plans Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage subscription plans
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingPlan(null);
                  setFormData({
                    name: "",
                    price: 0,
                    monthly_posts: 0,
                    ai_posts: 0,
                    linked_accounts: 0,
                    is_active: false,
                    description: "",
                    duration_months: 0,
                  });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? "Edit Plan" : "Create New Plan"}
                </DialogTitle>
                <DialogDescription>
                  {editingPlan
                    ? "Update plan details"
                    : "Add a new subscription plan"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_months">Duration (Months)</Label>
                  <Input
                    id="duration_months"
                    type="number"
                    value={formData.duration_months}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_months: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="monthly_posts">Monthly Posts</Label>
                  <Input
                    id="monthly_posts"
                    type="number"
                    value={formData.monthly_posts}
                    onChange={(e) => setFormData({ ...formData, monthly_posts: parseInt(e.target.value) })}
                    required
                  />
                </div> */}
                <div className="space-y-2">
                  <Label htmlFor="ai_posts">AI Posts</Label>
                  <Input
                    id="ai_posts"
                    type="number"
                    value={formData.ai_posts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ai_posts: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linked_accounts">Linked Accounts</Label>
                  <Input
                    id="linked_accounts"
                    type="number"
                    value={formData.linked_accounts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        linked_accounts: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                {/* <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div> */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Plans</CardTitle>
            <CardDescription>
              Manage subscription plans for your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration (Months)</TableHead>
                  <TableHead>AI Posts</TableHead>
                  <TableHead>Accounts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans?.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {plan.name || "N/A"}
                    </TableCell>
                    <TableCell>{plan.description || "N/A"}</TableCell>
                    <TableCell>{plan.price || "N/A"}</TableCell>
                    <TableCell>{plan.duration_months || "N/A"}</TableCell>
                    <TableCell>{plan.ai_posts || "N/A"}</TableCell>
                    <TableCell>{plan.linked_accounts || "N/A"}</TableCell>
                    <TableCell>
                      <Switch
                        checked={plan.is_active === true}
                        onCheckedChange={() => handleStatusToggle(plan)}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(plan)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>  
                    <TableCell>
                      {new Date(
                        (plan as any).created_at || Date.now()
                      ).toLocaleDateString()}
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

export default Plans;
