import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  price: number;
  monthly_posts: number;
  ai_posts: number;
  linked_accounts: number;
  is_active: boolean;
  features: any;
}

const Plans = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
    is_active: true,
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const api = new ApiService();
      const data = await api.getAllPlans();
      setPlans(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch plans.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const api = new ApiService();
      if (editingPlan) {
        await api.updatePlan(editingPlan.id, formData);
        toast({ title: "Success", description: "Plan updated successfully!" });
      } else {
        await api.createPlan(formData);
        toast({ title: "Success", description: "Plan created successfully!" });
      }
      setIsDialogOpen(false);
      setEditingPlan(null);
      setFormData({
        name: "",
        price: 0,
        monthly_posts: 0,
        ai_posts: 0,
        linked_accounts: 0,
        is_active: true,
      });
      await fetchPlans();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save plan.",
        variant: "destructive",
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
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const api = new ApiService();
      await api.deletePlan(id);
      toast({ title: "Success", description: "Plan deleted successfully!" });
      await fetchPlans();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan.",
        variant: "destructive",
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Plans Management</h1>
            <p className="text-muted-foreground">Create and manage subscription plans</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingPlan(null);
                setFormData({
                  name: "",
                  price: 0,
                  monthly_posts: 0,
                  ai_posts: 0,
                  linked_accounts: 0,
                  is_active: true,
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
                <DialogDescription>
                  {editingPlan ? "Update plan details" : "Add a new subscription plan"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_posts">Monthly Posts</Label>
                  <Input
                    id="monthly_posts"
                    type="number"
                    value={formData.monthly_posts}
                    onChange={(e) => setFormData({ ...formData, monthly_posts: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai_posts">AI Posts</Label>
                  <Input
                    id="ai_posts"
                    type="number"
                    value={formData.ai_posts}
                    onChange={(e) => setFormData({ ...formData, ai_posts: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linked_accounts">Linked Accounts</Label>
                  <Input
                    id="linked_accounts"
                    type="number"
                    value={formData.linked_accounts}
                    onChange={(e) => setFormData({ ...formData, linked_accounts: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
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
            <CardDescription>Manage subscription plans for your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Posts/Month</TableHead>
                  <TableHead>AI Posts</TableHead>
                  <TableHead>Accounts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>${plan.price}</TableCell>
                    <TableCell>{plan.monthly_posts}</TableCell>
                    <TableCell>{plan.ai_posts}</TableCell>
                    <TableCell>{plan.linked_accounts}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        plan.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
