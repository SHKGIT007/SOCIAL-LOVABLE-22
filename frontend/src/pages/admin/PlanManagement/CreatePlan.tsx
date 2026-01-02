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
    const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

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
      <div className="space-y-8">
        <div
          className="
    sticky top-0 z-10
    -mx-2 px-4 py-4
    bg-gradient-to-b from-white/90 to-white/70
    backdrop-blur
    border-b border-indigo-100
    flex flex-col sm:flex-row sm:items-center sm:justify-between
    gap-4
  "
        >
          {/* Left: Title */}
          <div>
            <h1 className="text-3xl font-extrabold">
              <span
                className={`text-transparent bg-clip-text ${primaryGradientClass}`}
              >
                Create
              </span>{" "}
              Plan
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              Create and manage plans.
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={exportExcel}
            >
              Export Excel
            </Button> */}

            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-indigo-50 transition"
            >
              ← Back
            </button>
          </div>
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
