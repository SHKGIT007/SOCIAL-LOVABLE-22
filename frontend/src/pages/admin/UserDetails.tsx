import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
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
        toast({ title: "Error", description: data.message || "User not found.", variant: "destructive" });
        navigate("/admin/users");
      }
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to fetch user.", variant: "destructive" });
      navigate("/admin/users");
    } finally {
      setIsLoading(false);
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

  if (!user) return null;

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-2xl mx-auto py-8">
        <button
          className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm border border-gray-300"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Name:</span> {user.user_name || "N/A"}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-semibold">Role:</span> <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
              </div>
              <div>
                <span className="font-semibold">Joined:</span> {new Date(user.created_at).toLocaleDateString()}
              </div>
              {user.subscription && (
                <div>
                  <span className="font-semibold">Plan:</span> {user.subscription.plan?.name || "No plan"}
                  <br />
                  <span className="font-semibold">Status:</span> <Badge variant={user.subscription.status === "active" ? "default" : "outline"}>{user.subscription.status || "inactive"}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDetails;
