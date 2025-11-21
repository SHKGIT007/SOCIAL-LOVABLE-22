import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const EditUserModal = ({
  open,
  onClose,
  userId,
  apiService,
  onUpdated,
}: Props) => {
  const [form, setForm] = useState({
    user_name: "",
    user_fname: "",
    user_lname: "",
    user_phone: "",
    email: "",
  });

  const [originalData, setOriginalData] = useState<any>(null);
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
      Swal.fire("Error", "Failed to load user data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    let { name, value } = e.target;

    // Only alphabets for fname/lname
    if (name === "user_fname" || name === "user_lname") {
      value = value.replace(/[^A-Za-z]/g, "");
    }

    // Only digits for phone (max 10 digits)
    if (name === "user_phone") {
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    setForm({ ...form, [name]: value });
  };

  const handleUpdate = async () => {
    // Validation
    if (form.user_phone.length !== 10) {
      Swal.fire("Invalid Phone", "Phone number must be 10 digits!", "error");
      return;
    }

    if (!form.email.includes("@") || !form.email.includes(".")) {
      Swal.fire("Invalid Email", "Please enter a valid email!", "error");
      return;
    }

    // No changes detection
    const noChanges =
      originalData &&
      originalData.user_name === form.user_name &&
      originalData.user_fname === form.user_fname &&
      originalData.user_lname === form.user_lname &&
      originalData.user_phone === form.user_phone &&
      originalData.email === form.email;

    if (noChanges) {
      Swal.fire({
        icon: "info",
        title: "No Changes",
        text: "No changes were made!",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

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
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
      modal={true}
    >
      <DialogContent
        className="max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
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
                name="user_name"
                value={form.user_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input name="email" value={form.email} onChange={handleChange} />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                name="user_phone"
                value={form.user_phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>First Name</Label>
              <Input
                name="user_fname"
                value={form.user_fname}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Last Name</Label>
              <Input
                name="user_lname"
                value={form.user_lname}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
