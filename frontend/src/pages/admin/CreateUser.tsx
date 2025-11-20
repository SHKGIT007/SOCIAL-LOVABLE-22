import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { apiService } from "@/services/api";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";

const CreateUser = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    user_name: "",
    user_fname: "",
    user_lname: "",
    email: "",
    password: "",
    user_phone: "",
    user_type: "client",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await apiService.createUser(formData);

      if (response?.status) {
        Swal.fire({
          icon: "success",
          title: "User Created",
          text: "User has been created successfully!",
          timer: 1500,
          showConfirmButton: false,
        });

        setTimeout(() => navigate("/admin/users"), 1500);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response?.message || "Unable to create user",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Something went wrong while creating user",
      });
    }

    setIsLoading(false);
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-3xl mx-auto mt-10">
        <Card className="shadow-lg border-indigo-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Create New User
            </CardTitle>
            <CardDescription>
              Fill the details below to create a new user
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <Input
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    name="user_phone"
                    value={formData.user_phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    name="user_fname"
                    value={formData.user_fname}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Last Name</Label>
                  <Input
                    name="user_lname"
                    value={formData.user_lname}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* <div>
                <Label>User Type</Label>
                <select
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div> */}

              <Button
                type="submit"
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateUser;
