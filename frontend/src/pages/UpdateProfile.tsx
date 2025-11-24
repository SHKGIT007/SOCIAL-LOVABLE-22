import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

const UpdateProfile = ({ apiService }: any) => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState({
    user_name: "",
    user_fname: "",
    user_lname: "",
    user_phone: "",
    email: "",
  });

  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("social_lovable_auth") || "{}");
    const id = auth?.user?.id;
    setUserId(id);
    if (id) fetchProfile(id);
  }, []);

  const fetchProfile = async (id: string) => {
    setLoading(true);
    try {
      const res = await apiService.getUserById(id);
      if (res.status === true) {
        const u = res.data.user;
        const userData = {
          user_name: u.user_name || "",
          user_fname: u.user_fname || "",
          user_lname: u.user_lname || "",
          user_phone: u.user_phone || "",
          email: u.email || "",
        };

        setForm(userData);
        setOriginalData(userData);
      }
    } catch (err) {
      Swal.fire("Error", "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    let { name, value } = e.target;

    if (name === "user_fname" || name === "user_lname") value = value.replace(/[^A-Za-z]/g, "");
    if (name === "user_phone") value = value.replace(/[^0-9]/g, "").slice(0, 10);

    setForm({ ...form, [name]: value });
  };

  const handleUpdate = async () => {
    if (form.user_phone.length !== 10) return Swal.fire("Invalid Phone", "Phone must be 10 digits", "error");
    if (!form.email.includes("@") || !form.email.includes(".")) return Swal.fire("Invalid Email", "Enter valid email", "error");

    const noChanges =
      originalData &&
      originalData.user_name === form.user_name &&
      originalData.user_fname === form.user_fname &&
      originalData.user_lname === form.user_lname &&
      originalData.user_phone === form.user_phone &&
      originalData.email === form.email;

    if (noChanges)
      return Swal.fire({ icon: "info", title: "No Changes", text: "You didn't change anything." });

    const confirm = await Swal.fire({
      icon: "warning",
      title: "Update Profile?",
      text: "Are you sure you want to save changes?",
      showCancelButton: true,
      confirmButtonText: "Yes, Update",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiService.updateUser(userId, form);
      if (res.status === true) Swal.fire("Success", "Profile updated successfully", "success");
      else Swal.fire("Error", res.message || "Update failed", "error");
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card className="shadow-md border rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Update Profile</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input name="user_name" value={form.user_name} onChange={handleChange} />
              </div>

              <div>
                <Label>Email</Label>
                <Input name="email" value={form.email} onChange={handleChange} />
              </div>

              <div>
                <Label>Phone</Label>
                <Input name="user_phone" value={form.user_phone} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input name="user_fname" value={form.user_fname} onChange={handleChange} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input name="user_lname" value={form.user_lname} onChange={handleChange} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleUpdate}>Save Changes</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateProfile;