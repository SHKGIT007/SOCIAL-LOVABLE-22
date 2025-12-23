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
      <div className="max-w-4xl mx-auto mt-10 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Plan</h2>
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
          SubmitBtn="Update Plan"
          enableReinitialize
        />
      </div>
    </DashboardLayout>
  );
};

export default EditPlanPage;
