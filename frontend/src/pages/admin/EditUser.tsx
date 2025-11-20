import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  apiService: any;
  onUpdated: () => void;
}

const EditUserModal = ({ open, onClose, userId, apiService, onUpdated }: Props) => {
  const [form, setForm] = useState({
    user_name: "",
    user_fname: "",
    user_lname: "",
    user_phone: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  // Load user data when modal opens
  useEffect(() => {
    if (open && userId) fetchUser();
  }, [open, userId]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await apiService.getUserById(userId);
      if (res.status === true) {
        const u = res.data.user;

        setForm({
          user_name: u.user_name || "",
          user_fname: u.user_fname || "",
          user_lname: u.user_lname || "",
          user_phone: u.user_phone || "",
          email: u.email || "",
        });
      }
    } catch (err) {
      Swal.fire("Error", "Failed to load user data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await apiService.updateUser(userId, form);

      if (res.status === true) {
        Swal.fire("Success", "User updated successfully", "success");
        onUpdated();
        onClose();
      } else {
        Swal.fire("Error", res.message || "Update failed", "error");
      }
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">

            <div>
              <Label>Name</Label>
              <Input
                value={form.user_name}
                onChange={(e) => setForm({ ...form, user_name: e.target.value })}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={form.user_phone}
                onChange={(e) => setForm({ ...form, user_phone: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleUpdate}>Update</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
