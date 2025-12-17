import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import * as Yup from "yup";
import ReusableForm from "@/components/ReusableForm";

const CreatePlanPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    name: "",
    price: "",
    ai_posts: "",
    linked_accounts: "",
    is_active: false,
    description: "",
    monthly_posts: 0,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Plan name required"),
    description: Yup.string().required("Description required"),
    price: Yup.number().required("Price required"),
    ai_posts: Yup.number().required("AI Posts required"),
    linked_accounts: Yup.number().required("Linked accounts required"),
  });

  const fields = [
    {
      name: "name",
      label: "Plan Name",
      placeholder: "Enter plan name",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      placeholder: "Enter description",
      required: true,
    },
    {
      name: "price",
      label: "Price",
      type: "number",
      placeholder: "Enter price",
      required: true,
    },
    {
      name: "ai_posts",
      label: "AI Posts",
      type: "number",
      placeholder: "Enter AI posts count",
      required: true,
    },
    {
      name: "linked_accounts",
      label: "Linked Accounts",
      type: "number",
      placeholder: "Enter linked accounts count",
      required: true,
    },
  ];

  const onSubmit = async (values: any) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "Do you want to create this plan?",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const res = await apiService.createPlan(values);

      if (res.status) {
        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Plan created successfully!",
        });
        navigate("/admin/plans");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.errors?.[0]?.msg || res.message,
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.errors?.[0]?.msg || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-4xl mx-auto mt-10 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create New Plan</h2>
          <button
            type="button"
            onClick={() => navigate("/admin/plans")}
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
          SubmitBtn="Create Plan"
        />
      </div>
    </DashboardLayout>
  );
};

export default CreatePlanPage;
