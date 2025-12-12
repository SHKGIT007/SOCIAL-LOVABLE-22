import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import * as Yup from "yup";
import ReusableForm from "@/components/ReusableForm";

const EditUserPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    user_fname: "",
    user_lname: "",
    user_name: "",
    user_phone: "",
    email: "",
  });

  const originalValuesRef = useRef(initialValues);

  const validationSchema = Yup.object({
    user_fname: Yup.string()
      .matches(/^[A-Za-z ]+$/, "Only alphabets are allowed")
      .required("First name is required"),
    user_lname: Yup.string()
      .matches(/^[A-Za-z ]+$/, "Only alphabets are allowed")
      .required("Last name is required"),
    user_name: Yup.string().required("Username is required"),
    user_phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
      .required("Phone is required"),
    email: Yup.string().email("Invalid email").required("Email required"),
  });

  const fields = [
    {
      name: "user_fname",
      label: "First Name",
      type: "alpha",
      required: true,
      placeholder: "Enter first name",
    },
    {
      name: "user_lname",
      label: "Last Name",
      type: "alpha",
      required: true,
      placeholder: "Enter last name",
    },
    {
      name: "user_name",
      label: "Username",
      required: true,
      placeholder: "Enter username",
    },
    {
      name: "user_phone",
      label: "Phone",
      type: "number",
      maxLength: 10,
      required: true,
      placeholder: "Enter 10-digit phone",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "Enter email",
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiService.getUserById(userId!);
        if (res.status) {
          const userData = res.data.user; // backend structure
          const [fname, lname] = (userData.user_name || " ").split(" ");

          const values = {
            user_fname: userData.user_fname || fname || "",
            user_lname: userData.user_lname || lname || "",
            user_name: userData.user_name || "",
            user_phone: userData.user_phone || "",
            email: userData.email || "",
          };

          setInitialValues(values);
          originalValuesRef.current = values; // store original for comparison
        } else {
          Swal.fire({ icon: "error", title: "Error", text: res.message });
          navigate("/admin/users");
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to fetch user",
        });
        navigate("/admin/users");
      }
    };
    fetchUser();
  }, [userId, navigate]);

  const onSubmit = async (values: any) => {
    if (loading) return;

    // --- Check if any changes made ---
    const changesMade = Object.keys(values).some(
      (key) =>
        values[key] !== originalValuesRef.current[key] &&
        key !== "password" &&
        key !== "confirm_password"
    );
    if (!changesMade && !values.password) {
      Swal.fire({
        icon: "info",
        title: "No changes",
        text: "No changes were made.",
      });
      return;
    }

    // --- Confirm before saving ---
    const confirmResult = await Swal.fire({
      icon: "question",
      title: "Confirm Update",
      text: "Are you sure you want to update this user?",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update",
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);
    try {
      const { confirm_password, ...payload } = values;

      // Remove password field if empty
      if (!payload.password) delete payload.password;

      const response = await apiService.updateUser(userId!, payload);

      if (response.status) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "User updated successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
        setTimeout(() => navigate("/admin/users"), 1500);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response?.errors?.[0]?.msg || response?.message,
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Something went wrong",
      });
    }
    setLoading(false);
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-4xl mx-auto mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit User</h2>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition"
          >
            Back
          </button>
        </div>

        <ReusableForm
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          fields={fields}
          loading={loading}
          SubmitBtn="Update User"
          enableReinitialize
        />
      </div>
    </DashboardLayout>
  );
};

export default EditUserPage;
