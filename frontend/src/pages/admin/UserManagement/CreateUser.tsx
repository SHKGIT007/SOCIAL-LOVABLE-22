import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import * as Yup from "yup";
import ReusableForm from "@/components/ReusableForm";

const CreateUser = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialValues = {
    user_fname: "",
    user_lname: "",
    user_name: "",
    user_phone: "",
    email: "",
    password: "",
    confirm_password: "",
    user_type: "client",
  };

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
    password: Yup.string()
  .required("Password required")
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
    "Password must contain at least one lowercase letter, one uppercase letter, and one number"
  ),

    confirm_password: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords do not match")
      .required("Confirm password required"),
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
    {
      name: "password",
      label: "Password",
      type: "passwordWithToggle",
      show: showPassword,
      onToggle: () => setShowPassword(!showPassword),
      required: true,
      placeholder: "Enter password",
      // helperText:
      //   "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    },
    {
      name: "confirm_password",
      label: "Confirm Password",
      type: "passwordWithToggle",
      show: showCPassword,
      onToggle: () => setShowCPassword(!showCPassword),
      required: true,
      placeholder: "Re-enter password",
    },
  ];

  const onSubmit = async (values) => {
    if (loading) return;

    const confirm = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "Do you want to create this user?",
      showCancelButton: true,
      confirmButtonText: "Yes, Create",
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);

    try {
      const { confirm_password, ...payload } = values;
      const response = await apiService.createUser(payload);

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
          text: response?.errors?.[0]?.msg || response?.message,
        });
      }
    } catch (err) {
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
          <h2 className="text-2xl font-bold">Create New User</h2>
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)} // Goes to previous page
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
          SubmitBtn="Create User"
        />
      </div>
    </DashboardLayout>
  );
};

export default CreateUser;
