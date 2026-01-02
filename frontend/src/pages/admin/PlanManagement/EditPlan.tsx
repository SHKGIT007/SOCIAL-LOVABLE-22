import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import * as Yup from "yup";
import ReusableForm from "@/components/ReusableForm";

const EditPlanPage = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<any>({
    name: "",
    price: 0,
    monthly_posts: 0,
    ai_posts: 0,
    linked_accounts: 0,
    is_active: false,
    description: "",
    // duration_months: 0,
  });

  const originalValuesRef = useRef(initialValues);
  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  const validationSchema = Yup.object({
    name: Yup.string().required("Plan name required"),
    price: Yup.number().required("Price required"),
    ai_posts: Yup.number().required("AI Posts required"),
    linked_accounts: Yup.number().required("Linked accounts required"),
    // duration_months: Yup.number().required("Duration required"),
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
    },
    { name: "price", label: "Price", type: "number", required: true },
    { name: "ai_posts", label: "AI Posts", type: "number", required: true },
    {
      name: "linked_accounts",
      label: "Linked Accounts",
      type: "number",
      required: true,
    },
    // {
    //   name: "duration_months",
    //   label: "Duration (Months)",
    //   type: "number",
    //   required: true,
    // },
  ];

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await apiService.getPlanById(planId!);
        if (res.status) {
          setInitialValues(res.data.plan);
          originalValuesRef.current = res.data.plan;
        } else {
          Swal.fire({ icon: "error", title: "Error", text: res.message });
          navigate("/admin/plans");
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to fetch plan",
        });
        navigate("/admin/plans");
      }
    };
    fetchPlan();
  }, [planId, navigate]);

  const onSubmit = async (values: any) => {
    const changesMade = Object.keys(values).some(
      (key) => values[key] !== originalValuesRef.current[key]
    );
    if (!changesMade) {
      Swal.fire({
        icon: "info",
        title: "No changes",
        text: "No changes were made.",
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "Confirm Update",
      text: "Are you sure you want to update this plan?",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      await apiService.updatePlan(planId!, values);
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Plan updated successfully!",
      });
      navigate("/admin/plans");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update plan",
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
                Edit
              </span>{" "}
              Plan
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              Edit and manage plans.
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
          SubmitBtn="Update Plan"
          enableReinitialize
        />
      </div>
    </DashboardLayout>
  );
};

export default EditPlanPage;
