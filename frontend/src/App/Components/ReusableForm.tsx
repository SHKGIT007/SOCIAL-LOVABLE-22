import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Eye, EyeOff } from "lucide-react";

const primaryGradient = "from-indigo-600 to-cyan-500";
const baseInputClasses =
  "w-full rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300 px-3 py-2 shadow-sm transition-all placeholder:text-gray-400";

const renderField = (field: any, form: any, values: any) => {
  switch (field.type) {
    case "textarea":
      return (
        <Field
          as="textarea"
          name={field.name}
          placeholder={field.placeholder}
          rows={field.rows || 4}
          className={`${baseInputClasses} min-h-[100px]`}
        />
      );

    case "select":
      return (
        <Field name={field.name}>
          {({ field: f, form }: any) => (
            <select
              {...f}
              className={baseInputClasses}
              onChange={(e) => form.setFieldValue(field.name, e.target.value)}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((o: any) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </Field>
      );

    case "multiSelect":
      return (
        <Field name={field.name}>
          {({ field: { value }, form }: any) => (
            <Select
              isMulti
              className="text-black"
              options={field.options}
              value={field.options.filter((opt: any) =>
                Array.isArray(value) ? value.includes(opt.value) : false
              )}
              onChange={(selected) =>
                form.setFieldValue(
                  field.name,
                  selected ? selected.map((o: any) => o.value) : []
                )
              }
            />
          )}
        </Field>
      );

    case "ckeditor":
      return (
        <Field name={field.name}>
          {({ field: f, form }: any) => (
            <CKEditor
              editor={ClassicEditor as any}
              data={f.value}
              onChange={(_, editor) =>
                form.setFieldValue(field.name, editor.getData())
              }
            />
          )}
        </Field>
      );

    case "date":
      return (
        <Field type="date" name={field.name} className={baseInputClasses} />
      );

    case "file":
      return (
        <Field name={field.name}>
          {({ form }: any) => (
            <input
              type="file"
              className={`${baseInputClasses} border-dashed`}
              multiple={field.multiple}
              onChange={(e: any) =>
                form.setFieldValue(
                  field.name,
                  field.multiple ? e.target.files : e.target.files[0]
                )
              }
            />
          )}
        </Field>
      );

    case "passwordWithToggle":
      return (
        <Field name={field.name}>
          {({ field: f }: any) => (
            <div className="relative">
              <input
                {...f}
                type={field.show ? "text" : "password"}
                placeholder={field.placeholder}
                className={`${baseInputClasses} pr-10`}
              />

              <button
                type="button"
                onClick={field.onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {field.show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}
        </Field>
      );

    case "number":
      return (
        <Field name={field.name}>
          {({ field: f }: any) => (
            <input
              {...f}
              type="text"
              maxLength={field.maxLength || 10}
              placeholder={field.placeholder}
              className={baseInputClasses}
              onInput={(e: any) => {
                const input = e.target as HTMLInputElement;
                input.value = input.value.replace(/[^0-9]/g, "");
              }}
            />
          )}
        </Field>
      );

    case "alpha":
      return (
        <Field name={field.name}>
          {({ field: f }: any) => (
            <input
              {...f}
              type="text"
              placeholder={field.placeholder}
              className={baseInputClasses}
              onInput={(e: any) => {
                const input = e.target as HTMLInputElement;
                input.value = input.value.replace(/[^A-Za-z ]/g, "");
              }}
            />
          )}
        </Field>
      );

    case "checkbox":
      return (
        <div className="flex items-center gap-2 mt-2">
          <Field type="checkbox" name={field.name} />
          <span>{field.label}</span>
        </div>
      );

    default:
      return (
        <Field
          type={field.type || "text"}
          name={field.name}
          placeholder={field.placeholder}
          className={baseInputClasses}
        />
      );
  }
};

const ReusableForm = ({
  initialValues,
  validationSchema,
  onSubmit,
  fields,
  SubmitBtn,
  enableReinitialize = false,
  loading = false,
}: any) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={enableReinitialize}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, values, form }: any) => (
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow-xl"
        >
          {fields.map((field: any) => (
            <div key={field.name} className="space-y-1 col-span-1">
              {/* Label */}
              {field.type !== "checkbox" && (
                <label className="text-sm font-semibold text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
              )}

              {renderField(field, form, values)}

              {/* Helper Text */}
              {field.helperText && (
                <p className="text-[11px] text-gray-500 mt-1">
                  {field.helperText}
                </p>
              )}

              {/* Error Message */}
              <ErrorMessage
                name={field.name}
                component="div"
                className="text-xs text-red-500 mt-1"
              />
            </div>
          ))}

          {/* Submit */}
          <div className="col-span-2 flex justify-end mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${primaryGradient} shadow-lg hover:opacity-90 transition`}
            >
              {loading ? "Processing..." : SubmitBtn || "Submit"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ReusableForm;
