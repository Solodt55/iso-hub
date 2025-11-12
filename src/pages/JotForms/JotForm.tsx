import React, { useEffect, useRef, useState } from "react";
import { FileText, Calendar, Loader2, FastForward } from "lucide-react";
import SignaturePad from "react-signature-canvas";
import { useSearchParams, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { AlertCircle } from "lucide-react";
import OwnerForm from "../../components/OwnerForm";
import BankingDocs from "../../components/BankingDocs";

interface FormData {
  signature_date: string;
  signature: string;

  business_dba: string;
  business_corporate_legal_name: string;
  business_location_address: string;
  business_corporate_address: string;
  business_city: string;
  business_state: string;
  business_zip: string;
  business_phone_number: string;
  business_contact_name: string;
  business_contact_number: string;
  business_start_date: string;
  business_tax_id: string;
  business_profile_business_type: string[];

  ownership_owner_name: string;
  ownership_title: string;
  ownership_percent: string;
  ownership_phone_number: string;
  ownership_city: string;
  ownership_state: string;
  ownership_zip: string;
  ownership_email: string;
  ownership_dob: string;
  ownership_social_security_number: string;
  ownership_residential_street_address: string;
  ownership_driver_licence_number: string;

  bank_name: string;
  aba_routing: string;
  doa: string;

  business_type: string[];
  processing_services: string[];

  terminal: string[];
  terminal_special_features: string;
  terminal_type_or_model: string;

  mobile_app: string[];
  mobile_app_special_features: string;
  mobile_app_cardreader_type_model: string;

  pos_point_of_sale: string[];
  pos_special_features: string;
  system_type_model: string;
  number_of_stations: string;
  pos_other_items: string;

  virtual_terminal: string[];
  business_type_other: string;
  location_description: string;
  estimation_early_master_card: string;
  estimated_average_ticket: string;

  // Credit Card Processing Information
  estimated_highest_ticket: string;
  transaction_card_present: string;
  transaction_keyed_in: string;
  transaction_all_online: string;
  auto_settle_time: string;
  auto_settle_type: string; // 'auto' or 'manual'
  add_tips_to_account: string; // 'yes' or 'no'
  tip_amounts: string[];
  is_same_shipping_address: string;
  business_website: string;
  business_legal_name: string;
  business_products_sold: string;
  business_return_policy: string;
  terminal_other: string;

  // New fields for shipping address
  shipping_street_address: string;
  shipping_street_address2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;

  // Business Information fields
  dba_street_address: string;
  dba_street_address2: string;

  // Corporate Contact Information fields
  corporate_street_address1: string;
  corporate_street_address2: string;
  corporate_city: string;
  corporate_state: string;
  corporate_zip: string;
  business_location_phone_number: string;
  business_contact_mail: string;
}

// Put this outside your component
const blankFormData: FormData = {
  signature_date: "",
  signature: "",

  business_dba: "",
  business_corporate_legal_name: "",
  business_location_address: "",
  business_corporate_address: "",
  business_city: "",
  business_state: "",
  business_zip: "",
  business_phone_number: "",
  business_contact_name: "",
  business_contact_number: "",
  business_start_date: "",
  business_tax_id: "",
  business_profile_business_type: [],

  ownership_owner_name: "",
  ownership_title: "",
  ownership_percent: "",
  ownership_phone_number: "",
  ownership_city: "",
  ownership_state: "",
  ownership_zip: "",
  ownership_email: "",
  ownership_dob: "",
  ownership_social_security_number: "",
  ownership_residential_street_address: "",
  ownership_driver_licence_number: "",

  bank_name: "",
  aba_routing: "",
  doa: "",

  business_type: [],
  processing_services: [],

  terminal: [],
  terminal_special_features: "",
  terminal_type_or_model: "",

  mobile_app: [],
  mobile_app_special_features: "",
  mobile_app_cardreader_type_model: "",

  pos_point_of_sale: [],
  pos_special_features: "",
  system_type_model: "",
  number_of_stations: "",
  pos_other_items: "",

  virtual_terminal: [],
  business_type_other: "",
  location_description: "",
  estimation_early_master_card: "",
  estimated_average_ticket: "",

  // Credit Card Processing Information
  estimated_highest_ticket: "",
  transaction_card_present: "",
  transaction_keyed_in: "",
  transaction_all_online: "",
  auto_settle_time: "",
  auto_settle_type: "auto",
  add_tips_to_account: "no",
  tip_amounts: [],
  is_same_shipping_address: "1",
  business_website: "",
  business_legal_name: "",
  business_products_sold: "",
  business_return_policy: "",
  terminal_other: "",

  // New fields for shipping address
  shipping_street_address: "",
  shipping_street_address2: "",
  shipping_city: "",
  shipping_state: "",
  shipping_zip: "",

  // Business Information fields
  dba_street_address: "",
  dba_street_address2: "",

  // Corporate Contact Information fields
  corporate_street_address1: "",
  corporate_street_address2: "",
  corporate_city: "",
  corporate_state: "",
  corporate_zip: "",
  business_location_phone_number: "",
  business_contact_mail: "",
};

// Add this CSS at the top of the file
const datePickerStyles = `
  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.5;
    cursor: pointer;
  }
`;

type OwnerImage = {
  file: File;
  url: string;
  name: string;
  size: string;
};
type OwnerData = {
  [key: string]: any;
  driver_license_image: OwnerImage[];
};
type BankingDoc = {
  file: File;
  url: string;
  name: string;
  size: string;
};

export default function JotForm() {
  const [formData, setFormData] = useState<FormData>({ ...blankFormData });
  const [ownerFormData, setOwnerFormData] = useState<OwnerData[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<BankingDoc[]>([]);

  const signatureRef = useRef<SignaturePad>(null);

  const [isValidLink, setIsValidLink] = useState<boolean>(false);
  const [isCheckingLink, setIsCheckingLink] = useState<boolean>(true);
  const [searchParams] = useSearchParams();
  const { user_id } = useParams<{ user_id: string }>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const data = searchParams.get("data");
  const formId = searchParams.get("id") ?? "";
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [isReadOnly, setIsReadOnly] = useState<{
    readOnly?: boolean;
    disabled?: boolean;
  }>({});

  useEffect(() => {
    const checkUniqueString = async () => {
      // if (!data) {
      //   setIsValidLink(true);
      //   setIsCheckingLink(false);
      //   setIsReadOnly({}); // No readonly/disabled when no URL data
      //   setFormData({ ...blankFormData });
      //   return;
      // }

      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/jotform-check-unique-string/${user_id}`
        );
        const responseData = await response.json();

        if (response.ok) {
          setIsValidLink(true);

          // Store fetched data if available
          if (responseData.data && Object.keys(responseData.data).length > 0) {
            console.log("Form data before setting:", responseData.data);
            // Ensure arrays are properly handled
            const formattedData = {
              ...responseData.data,
              business_profile_business_type: Array.isArray(
                responseData.data.business_profile_business_type
              )
                ? responseData.data.business_profile_business_type
                : [],
              business_type: Array.isArray(responseData.data.business_type)
                ? responseData.data.business_type
                : [],
              processing_services: Array.isArray(
                responseData.data.processing_services
              )
                ? responseData.data.processing_services
                : [],
              terminal: Array.isArray(responseData.data.terminal)
                ? responseData.data.terminal
                : [],
              mobile_app: Array.isArray(responseData.data.mobile_app)
                ? responseData.data.mobile_app
                : [],
              pos_point_of_sale: Array.isArray(
                responseData.data.pos_point_of_sale
              )
                ? responseData.data.pos_point_of_sale
                : [],
              virtual_terminal: Array.isArray(
                responseData.data.virtual_terminal
              )
                ? responseData.data.virtual_terminal
                : [],
            };
            console.log("Formatted form data:", formattedData);
            setFormData((prev) => ({ ...prev, ...formattedData }));
            setIsReadOnly({ readOnly: true, disabled: true }); // Set both readonly and disabled
          } else {
            console.log("No data received, setting blank form");
            setFormData({ ...blankFormData });
            setIsReadOnly({}); // No readonly/disabled when no data
          }
        } else {
          setIsValidLink(false);
          setIsReadOnly({}); // No readonly/disabled on error
          toast.error("Invalid or expired upload link");
        }
      } catch (error) {
        console.error("Error checking link:", error);
        setIsValidLink(false);
        setIsReadOnly({}); // No readonly/disabled on error
        toast.error("Failed to validate upload link");
      } finally {
        setIsCheckingLink(false);
      }
    };

    checkUniqueString();
    setIsReadOnly({}); // No readonly/disabled when no URL data
  }, [data]);

  // Add a useEffect to log state changes
  useEffect(() => {
    // console.log('Current readonly state:', isReadOnly);
    // console.log('Current form data:', formData);
  }, [isReadOnly, formData]);

  const handleBankingDocsChange = (files: BankingDoc[]) => {
    setUploadedFiles(files);
    console.log("Files received from child:", files);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      const cleanName = name.replace("[]", ""); // Remove [] if present

      setFormData((prev) => {
        const existing = Array.isArray(prev[cleanName as keyof FormData])
          ? (prev[cleanName as keyof FormData] as string[])
          : [];

        if (checked) {
          return {
            ...prev,
            [cleanName]: [...existing, value],
          };
        } else {
          return {
            ...prev,
            [cleanName]: existing.filter((v: string) => v !== value),
          };
        }
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    // Validate each owner's required fields
    for (let i = 0; i < ownerFormData.length; i++) {
      const owner = ownerFormData[i];
      const missingFields = [];

      if (!owner.ownership_driver_licence_number) missingFields.push("Driver Licence Number");

      // Check required file
      if (!owner.driver_license_image || owner.driver_license_image.length === 0) {
        missingFields.push("Driver's License File");
      }

      if (missingFields.length > 0) {
        // alert();
        toast.error(`Owner ${i + 1} is missing: ${missingFields.join(", ")}`);
        return;
      }
    }

    // ✅ Check banking docs
    if (!uploadedFiles || uploadedFiles.length === 0) {
      toast.error("Please upload at least one Banking Document.");
      return;
    }

    // ✅ Validate business_profile_business_type (must have at least one selected)
    if (
      !formData.business_profile_business_type ||
      formData.business_profile_business_type.length === 0
    ) {
      toast.error("Please select at least one Business Type.");
      return;
    }

     // ✅ Validate business_profile_business_type (must have at least one selected)

     if(formData.add_tips_to_account === "yes"){
       if (
         !formData.tip_amounts ||
         formData.tip_amounts.length === 0 
       ) {
         toast.error("Please select at least one Tip Amount.");
         return;
       }
     }

    const signaturePad = signatureRef.current;
    const signatureData =
      signaturePad && !signaturePad.isEmpty() ? signaturePad.toDataURL() : "";
    // Reset previous errors
    setErrors({});

    if (!signatureData) {
      toast.error("Please provide a signature");
      return;
    }

    if (!user_id) {
      toast.error("Invalid form link");
      return;
    }

    // Build FormData for multipart/form-data
    const formDataToSend = new FormData();
    // Append all text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Convert array to JSON string for database storage
        formDataToSend.append(key, JSON.stringify(value));
      } else {
        formDataToSend.append(key, value);
      }
    });

    formDataToSend.append("signature", signatureData);
    formDataToSend.append("user_id", user_id);
    formDataToSend.append("form_id", formId);

    // Append owner data and files
    ownerFormData.forEach((owner, ownerIdx) => {
      Object.entries(owner).forEach(([key, value]) => {
        if (key === "driver_license_image" && Array.isArray(value)) {
          (value as OwnerImage[]).forEach((imgObj, fileIdx) => {
            if (imgObj && imgObj.file instanceof File) {
              formDataToSend.append(
                `owners[${ownerIdx}][driver_license_image][${fileIdx}]`,
                imgObj.file
              );
            }
          });
        } else if (typeof value === "string" || typeof value === "number") {
          formDataToSend.append(`owners[${ownerIdx}][${key}]`, String(value));
        }
      });
    });

    // Append banking docs files
    uploadedFiles.forEach((imgObj, idx) => {
      if (imgObj && imgObj.file instanceof File) {
        formDataToSend.append(`bankingDocs[${idx}]`, imgObj.file);
      }
    });

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/jot-forms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Do NOT set Content-Type header for FormData
          },
          body: formDataToSend,
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          const validationErrors = responseData.errors || {};
          setErrors(validationErrors);

          // Show toast for each error message
          Object.values(validationErrors).forEach(
            (fieldErrors: string[] | any) => {
              fieldErrors.forEach((msg: string) => toast.error(msg));
            }
          );
        } else {
          toast.error(responseData.message || "Form submission failed");
        }
        return;
      }

      toast.success(responseData.message || "Form submitted successfully!");

      // Reset form on success
      setFormData({ ...blankFormData });
      signaturePad?.clear();

      setTimeout(() => {
        location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const message = error?.message?.includes("Failed to fetch")
        ? "Network error. Please check your internet connection and try again."
        : error.message || "Failed to submit form. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  if (isCheckingLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="bg-white rounded-lg shadow-xl p-8 border border-yellow-400/20 text-center max-w-md w-full">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Validating ISO Form link...</p>
        </div>
      </div>
    );
  }

  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="bg-white rounded-lg shadow-xl p-8 border border-yellow-400/20 text-center max-w-md w-full">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid ISO Form Link
          </h1>
          <p className="text-gray-600 mb-6">
            This ISO Form link is invalid or has expired. Please contact your
            administrator to request a new secure ISO Form link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <style>{datePickerStyles}</style>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 bg-tracer-green rounded-lg p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-10 w-10 text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white">
                Merchant Pre-Application
              </h1>
              <p className="text-white/80 mt-1">Tracer C2 Financial Services</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {Object.keys(isReadOnly).length > 0 && (
            <input type="hidden" name="is_duplicate" value="1" />
          )}

          <input type="hidden" name="form_id" value={formId} />
          {/* BUSINESS PROFILE */}
          <fieldset className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            <legend className="text-lg font-semibold text-gray-800 px-2">
              BUSINESS PROFILE
              <span className="ml-2 text-sm text-red-400 font-normal">
                (*Required)
              </span>
            </legend>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Doing Business As (DBA)
                </label>
                <input
                  type="text"
                  required
                  onChange={handleInputChange}
                  name="business_dba"
                  value={formData.business_dba}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.business_dba ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {/* {errors.business_dba && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.business_dba[0]}
                  </p>
                )} */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input
                  type="text"
                  {...isReadOnly}
                  onChange={handleInputChange}
                  required
                  name="dba_street_address"
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.dba_street_address
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />

                {/* {errors.dba_street_address && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dba_street_address[0]}
                  </p>
                )} */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Street Address Line 2
                </label>
                <input
                  type="text"
                  name="dba_street_address2"
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.dba_street_address2
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {/* {errors.dba_street_address2 && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dba_street_address2[0]}
                  </p>
                )} */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="business_city"
                    onChange={handleInputChange}
                    required
                    value={formData.business_city}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.business_city
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {/* {errors.business_city && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.business_city[0]}
                    </p>
                  )} */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="business_state"
                    required
                    onChange={handleInputChange}
                    value={formData.business_state}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.business_state
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {/* {errors.business_state && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.business_state[0]}
                    </p>
                  )} */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ZIP
                  </label>
                  <input
                    type="text"
                    name="business_zip"
                    required
                    onChange={handleInputChange}
                    value={formData.business_zip}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.business_zip ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {/* {errors.business_zip && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_zip[0]}</p>
                  )} */}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { value: "LLC", label: "LLC" },
                    { value: "Corp", label: "Corp" },
                    { value: "Non-Profit", label: "Non-Profit" },
                    { value: "Sole Prop", label: "Sole Prop" },
                    { value: "Gov", label: "Gov" },
                    { value: "Association/Estate/Trust", label: "Association/Estate/Trust" },
                    { value: "Other", label: "Other" },
                  ].map(({ value, label }) => (
                    <label
                      key={value}
                      className="inline-flex items-center text-gray-700"
                    >
                      <input
                        type="checkbox" 
                        // required                       
                        onChange={handleInputChange}
                        name="business_profile_business_type"
                        value={value}
                        checked={formData.business_profile_business_type.includes(
                          value
                        )}
                        className="mr-2 h-4 w-4 border-gray-300 text-tracer-green focus:ring-tracer-green"
                      />
                      {label}
                      {/* {errors.business_profile_business_type && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.business_profile_business_type[0]}
                        </p>
                      )} */}
                    </label>
                  ))}
                </div>
                {formData.business_profile_business_type.includes("Other") && (
                  <div className="mt-4">
                    {/* <label className="block text-sm font-medium text-gray-700">Other</label> */}
                    <input
                      type="text"
                      placeholder="Please type another option here"
                      name="business_profile_business_type_other"
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.business_profile_business_type_other
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Address
                </label>

                {/* <label className="inline-flex items-center text-gray-700">
                  <input
                    type="radio"
                    name="is_same_shipping_address"
                    value="1"
                    required
                    checked={formData.is_same_shipping_address === "1"}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 border-gray-300 text-tracer-green focus:ring-tracer-green"
                  />
                  Shipping Address is the Same
                </label> */}


                <label className="inline-flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    name="is_same_shipping_address"
                    checked={formData.is_same_shipping_address === "1"}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        is_same_shipping_address: e.target.checked ? "1" : "0"
                      }));
                    }}
                    className="mr-2 h-4 w-4 border-gray-300 text-tracer-green focus:ring-tracer-green"
                  />
                  Yes, same as street address above
                </label>


                {formData.is_same_shipping_address === "0" && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Street Address</label>
                      <input
                        type="text"
                        name="shipping_street_address"
                        value={formData.shipping_street_address || ""}
                        required
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm ${errors.shipping_street_address ? "border-red-500" : "border-gray-300"}`}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Street Address Line 2</label>
                      <input
                        type="text"
                        name="shipping_street_address2"
                        value={formData.shipping_street_address2 || ""}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm ${errors.shipping_street_address2 ? "border-red-500" : "border-gray-300"}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        name="shipping_city"
                        required
                        value={formData.shipping_city || ""}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm ${errors.shipping_city ? "border-red-500" : "border-gray-300"}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        name="shipping_state"
                        required
                        value={formData.shipping_state || ""}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm ${errors.shipping_state ? "border-red-500" : "border-gray-300"}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ZIP</label>
                      <input
                        type="text"
                        name="shipping_zip"
                        required
                        value={formData.shipping_zip || ""}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm ${errors.shipping_zip ? "border-red-500" : "border-gray-300"}`}
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>
          </fieldset>

          {/* Corporate Contact */}
          <fieldset className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            <legend className="text-lg font-semibold text-gray-800 px-2">
              Corporate Contact Information
              <span className="ml-2 text-sm text-red-400 font-normal">
                (*Required)
              </span>
            </legend>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="corporate_street_address1"
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.corporate_street_address1
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {/* {errors.corporate_street_address1 && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.corporate_street_address1[0]}
                  </p>
                )} */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Street Address Line 2
                </label>
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="corporate_street_address2"
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.corporate_street_address2
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />

                {/* {errors.corporate_street_address2 && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.corporate_street_address2[0]}
                  </p>
                )} */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="corporate_city"
                    onChange={handleInputChange}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.corporate_city
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {/* {errors.corporate_city && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.corporate_city[0]}
                    </p>
                  )} */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="corporate_state"
                    onChange={handleInputChange}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.corporate_state
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {/* {errors.corporate_state && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.corporate_state[0]}
                    </p>
                  )} */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ZIP
                  </label>
                  <input
                    type="text"
                    name="corporate_zip"
                    required
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.corporate_zip
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {/* {errors.corporate_zip && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.corporate_zip[0]}
                    </p>
                  )} */}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    {...isReadOnly}
                    name="business_contact_name"
                    onChange={handleInputChange}
                    value={formData.business_contact_name}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.business_contact_name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  required  
                  />
                  {/* {errors.business_contact_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.business_contact_name[0]}
                    </p>
                  )} */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <input
                    type="text"
                    {...isReadOnly}
                    name="business_contact_mail"
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.business_contact_mail
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />

                  {/* {errors.business_contact_mail && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.business_contact_mail[0]}
                    </p>
                  )} */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location Phone Number
                  </label>
                  <input
                    type="number"
                    name="business_location_phone_number"
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.business_location_phone_number
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  required
                  />
                  {/* {errors.business_location_phone_number && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.business_location_phone_number[0]}
                    </p>
                  )} */}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date Business Started
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="business_start_date"
                      required
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded bg-white text-gray-700 border border-gray-300 focus:border-tracer-green focus:ring-tracer-green px-3 py-2"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Business Website
                  </label>
                  <input
                    type="text"
                    name="business_website"
                    onChange={handleInputChange}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.business_website
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />

                  {/* {errors.business_website && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.business_website[0]}
                    </p>
                  )} */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Business Legal Name as appears on tax return
                  </label>
                  <input
                    type="text"
                    name="business_legal_name"
                    onChange={handleInputChange}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.business_legal_name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {/* {errors.business_legal_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.business_legal_name[0]}
                    </p>
                  )} */}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Federal Tax ID
                  </label>
                  <input
                    type="text"
                    {...isReadOnly}
                    name="business_tax_id"
                    onChange={handleInputChange}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.business_tax_id
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {/* {errors.business_federal_tax_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.business_federal_tax_id[0]}
                    </p>
                  )} */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Products Sold or Services Provided
                  </label>
                  <input
                    type="text"
                    {...isReadOnly}
                    name="business_products_sold"
                    onChange={handleInputChange}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.business_products_sold
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />

                  {/* {errors.business_products_sold && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.business_products_sold[0]}
                    </p>
                  )} */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Return Policy
                  </label>
                  <input
                    type="text"
                    {...isReadOnly}
                    name="business_return_policy"
                    onChange={handleInputChange}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.business_return_policy
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {/* {errors.business_return_policy && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.business_return_policy[0]}
                    </p>
                  )} */}
                </div>
              </div>
            </div>
          </fieldset>

          {/* OWNERSHIP */}

          <fieldset className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            <legend className="text-lg font-semibold text-gray-800 px-2">
              Owner / Officer Information
              <span className="ml-2 text-sm text-red-400 font-normal">
                (*Required)
              </span>
            </legend>

            <OwnerForm
              formData={ownerFormData}
              setFormData={setOwnerFormData}
            />
          </fieldset>

          {/* BANKING INFORMATION */}

          <fieldset className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            <legend className="text-lg font-semibold text-gray-800 px-2">
              BANKING INFORMATION
              <span className="ml-2 text-sm text-red-400 font-normal">
                (*Required)
              </span>
            </legend>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bank_name"
                    onChange={handleInputChange}
                    value={formData.bank_name}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.bank_name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {/* {errors.bank_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.bank_name[0]}
                    </p>
                  )} */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    TransitABARouting Number
                  </label>
                  <input
                    type="text"
                    name="aba_routing"
                    required
                    onChange={handleInputChange}
                    value={formData.aba_routing}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.aba_routing ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {/* {errors.aba_routing && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.aba_routing[0]}
                    </p>
                  )} */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deposit Account Number
                  </label>
                  <input
                    type="text"
                    name="doa"
                    required
                    onChange={handleInputChange}
                    value={formData.doa}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.doa ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {/* {errors.doa && (
                    <p className="text-red-500 text-sm mt-1">{errors.doa[0]}</p>
                  )} */}
                </div>
              </div>
              <BankingDocs onFilesChange={handleBankingDocsChange} />
            </div>
          </fieldset>

          {/* BUSINESS TYPE */}

          <fieldset className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            <legend className="text-lg font-semibold text-gray-800 px-2">
              BUSINESS TYPE

              <span className="ml-2 text-sm text-red-400 font-normal">
                (*Required)
              </span>

            </legend>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { value: "Retail", label: "Retail" },
                    { value: "Hospitality", label: "Hospitality" },
                    { value: "Services", label: "Services" },
                    { value: "B2B", label: "B2B" },
                    { value: "Other", label: "Other" },
                  ].map(({ value, label }) => (
                    <label
                      key={value}
                      className="inline-flex items-center text-gray-700"
                    >
                      <input
                        type="radio"
                        name="business_type"
                        required
                        value={value}
                        checked={formData.business_type === value}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 border-gray-300 text-tracer-green focus:ring-tracer-green"
                      />
                      {label}
                    </label>
                  ))}
                </div>

                {/* {errors.business_type && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.business_type[0]}
                  </p>
                )} */}
              </div>

              {/* Show "Other" input if selected */}
              {formData.business_type === "other" && (
                <div>
                  <input
                    type="text"
                    name="business_type_other"
                    placeholder="Please type another option here"
                    value={formData.business_type_other}
                    onChange={handleInputChange}
                    className={`mt-2 block w-full rounded-md shadow-sm ${
                      errors.business_type_other
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>
              )}
            </div>
          </fieldset>

          {/* PROCESSING SERVICES */}
          <fieldset className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            <legend className="text-lg font-semibold text-gray-800 px-2">
              PROCESSING SERVICES
              <span className="ml-2 text-sm font-normal text-tracer-green">
                (* Not required — leave blank if unsure)
              </span>
            </legend>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processing Services (Select Multiple)
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      {
                        value: "Traditional Processing",
                        label: "Traditional Processing",
                      },
                      { value: "Surcharging", label: "Surcharging" },
                      { value: "QR Code", label: "QR Code" },
                      { value: "Check Services", label: "Check Services" },
                      {
                        value: "QB/Software Integration",
                        label: "QB/Software Integration",
                      },
                      { value: "Cash Discounting", label: "Cash Discounting" },
                      {
                        value: "Online Ordering(OLO)",
                        label: "Online Ordering(OLO)",
                      },
                      { value: "Gift Cards", label: "Gift Cards" },
                      { value: "Invoice Manager", label: "Invoice Manager" },
                    ].map(({ value, label }) => (
                      <label
                        key={value}
                        className="inline-flex items-center text-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          name="processing_services[]"
                          onChange={handleInputChange}
                          value={value}
                          checked={
                            Array.isArray(formData.processing_services) &&
                            formData.processing_services.includes(value)
                          }
                          className="mr-2 h-4 w-4 border-gray-300 text-tracer-green focus:ring-tracer-green cursor-pointer"
                        />
                        {label}
                      </label>
                    ))}
                  </div>

                  {/* {errors.processing_services && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.processing_services[0]}
                    </p>
                  )} */}
                </div>
              </div>
            </div>
          </fieldset>

          {/* PROCESSING HARDWARE */}

          <fieldset className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            <legend className="text-lg font-semibold text-gray-800 px-2">
              PROCESSING HARDWARE
              <span className="ml-2 text-sm font-normal text-tracer-green">
                (* Not required — leave blank if unsure)
              </span>
            </legend>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terminal
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { value: "Dial", label: "Dial" },
                      { value: "IP", label: "IP" },
                      { value: "WIFI", label: "WIFI" },
                      { value: "4G", label: "4G" },
                      { value: "Other", label: "Other" },
                    ].map(({ value, label }) => (
                      <label
                        key={value}
                        className="inline-flex items-center text-gray-700"
                      >
                        <input
                          type="radio"
                          name="terminal"
                          onChange={handleInputChange}
                          value={value}
                          checked={formData.terminal === value}
                          className="mr-2 h-4 w-4 border-gray-300 text-tracer-green focus:ring-tracer-green"
                        />
                        {label}
                      </label>
                    ))}

                    {/* Show input box when "other" is selected */}
                    {formData.terminal === "Other" && (
                      <div className="w-full mt-2">
                        <input
                          type="text"
                          placeholder="Please type another option here"
                          name="terminal_other"
                          onChange={handleInputChange}
                          value={formData.terminal_other}
                          className={`block w-full rounded-md shadow-sm ${
                            errors.terminal_other
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {/* {errors.terminal_other && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.terminal_other[0]}
                          </p>
                        )} */}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Terminal Type/Model
                  </label>
                  <input
                    type="text"
                    name="terminal_type_or_model"
                    onChange={handleInputChange}
                    value={formData.terminal_type_or_model}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.terminal_type_or_model
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.terminal_type_or_model && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.terminal_type_or_model[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile App
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { value: "IOS", label: "IOS" },
                      { value: "Android", label: "Android" },
                    ].map(({ value, label }) => (
                      <label
                        key={value}
                        className="inline-flex items-center text-gray-700"
                      >
                        <input
                          type="radio"
                          name="mobile_app"
                          onChange={handleInputChange}
                          value={value}
                          checked={formData.mobile_app === value}
                          className="mr-2 h-4 w-4 border-gray-300 text-tracer-green focus:ring-tracer-green"
                        />
                        {label}
                      </label>
                    ))}

                    {/* {errors.mobile_app && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.mobile_app[0]}
                      </p>
                    )} */}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mobile App Special Features (Optional)
                    </label>
                    <input
                      type="text"
                      name="mobile_app_special_features"
                      onChange={handleInputChange}
                      value={formData.mobile_app_special_features}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.mobile_app_special_features
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {/* {errors.mobile_app_special_features && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.mobile_app_special_features[0]}
                      </p>
                    )} */}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cardreader Type/Model
                    </label>
                    <input
                      type="text"
                      name="mobile_app_cardreader_type_model"
                      onChange={handleInputChange}
                      value={formData.mobile_app_cardreader_type_model}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.mobile_app_cardreader_type_model
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {/* {errors.mobile_app_cardreader_type_model && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.mobile_app_cardreader_type_model[0]}
                      </p>
                    )} */}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    POS (Point of Sale) System
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { value: "ios", label: "IOS" },
                      { value: "android", label: "Android" },
                      { value: "windows_or_pc", label: "Windows/PC" },
                    ].map(({ value, label }) => (
                      <label
                        key={value}
                        className="inline-flex items-center text-gray-700"
                      >
                        <input
                          type="radio"
                          {...isReadOnly}
                          name="pos_point_of_sale"
                          value={value}
                          onChange={handleInputChange}
                          checked={formData.pos_point_of_sale === value}
                          className="mr-2 h-4 w-4 border-gray-300 text-tracer-green focus:ring-tracer-green"
                        />
                        {label}
                      </label>
                    ))}

                    {/* {errors.pos_point_of_sale && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.pos_point_of_sale[0]}
                      </p>
                    )} */}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      POS Special Features
                    </label>
                    <input
                      type="text"
                      name="pos_special_features"
                      onChange={handleInputChange}
                      value={formData.pos_special_features}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.pos_special_features
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {/* {errors.pos_special_features && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.pos_special_features[0]}
                      </p>
                    )} */}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      System Type Model
                    </label>
                    <input
                      type="text"
                      name="system_type_model"
                      onChange={handleInputChange}
                      value={formData.system_type_model}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.system_type_model
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {/* {errors.system_type_model && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.system_type_model[0]}
                      </p>
                    )} */}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Stations
                    </label>
                    <input
                      type="text"
                      name="number_of_stations"
                      onChange={handleInputChange}
                      value={formData.number_of_stations}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.number_of_stations
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {/* {errors.number_of_stations && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.number_of_stations[0]}
                      </p>
                    )} */}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      POS other items
                    </label>
                    <input
                      type="text"
                      name="pos_other_items"
                      onChange={handleInputChange}
                      value={formData.pos_other_items}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.pos_other_items
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {/* {errors.pos_other_items && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.pos_other_items[0]}
                      </p>
                    )} */}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Virtual Terminal
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      {
                        value: "Text/Email Link to Pay",
                        label: "Text/Email Link to Pay",
                      },
                      {
                        value: "Hot Button on Web Pay Now/Donate Now",
                        label: "Hot Button on Web Pay Now/Donate Now",
                      },
                      {
                        value: "CNP Cash Discount/Surcharge",
                        label: "CNP Cash Discount/Surcharge",
                      },
                      {
                        value: "Text Notification",
                        label: "Text Notification",
                      },
                    ].map(({ value, label }) => (
                      <label
                        key={value}
                        className="inline-flex items-center text-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          name="virtual_terminal[]"
                          onChange={handleInputChange}
                          value={value}
                          checked={
                            Array.isArray(formData.virtual_terminal) &&
                            formData.virtual_terminal.includes(value)
                          }
                          className="mr-2 h-4 w-4 border-gray-300 text-tracer-green focus:ring-tracer-green cursor-pointer"
                        />
                        {label}
                      </label>
                    ))}

                    {/* {errors.virtual_terminal && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.virtual_terminal[0]}
                      </p>
                    )} */}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Description
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      {
                        value: "Shopping center",
                        label: "Shopping center",
                      },
                      {
                        value: "Industrial Building",
                        label: "Industrial Building",
                      },
                      {
                        value: "Residence",
                        label: "Residence",
                      },
                      {
                        value: "Tradeshow",
                        label: "Tradeshow",
                      },
                      {
                        value: "Brick and Mortar",
                        label: "Brick and Mortar",
                      },
                    ].map(({ value, label }) => (
                      <label
                        key={value}
                        className="inline-flex items-center text-gray-700"
                      >
                        <input
                          type="radio"
                          name="location_description"
                          onChange={handleInputChange}
                          value={value}
                          checked={formData.location_description === value}
                          className="mr-2 h-4 w-4 border-gray-300 text-tracer-green focus:ring-tracer-green"
                        />
                        {label}
                      </label>
                    ))}

                    {/* {errors.location_description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.location_description[0]}
                      </p>
                    )} */}
                  </div>
                </div>

              
              </div>
            </div>
          </fieldset>

          {/* CREDIT CARD PROCESSING INFORMATION */}
          <fieldset className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            <legend className="text-lg font-semibold text-gray-800 px-2">
              Credit Card Processing Information
              <span className="ml-2 text-sm text-red-400 font-normal">
                (*Required)
              </span>
            </legend>
            <p className="text-xs text-gray-500 italic mt-2 mb-4">Use your best judgment and aim high - It's better to over estimate than under estimate.</p>
            <div className="space-y-6">


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estimated Yearly VisaMastercardAMEXDiscover
                  </label>
                  <input
                    type="text"
                    required
                    name="estimation_early_master_card"
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.estimation_early_master_card
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {/* {errors.estimation_early_master_card && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.estimation_early_master_card[0]}
                    </p>
                  )} */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estimated Average Ticket
                  </label>
                  <input
                    type="text"
                    required
                    name="estimated_average_ticket"
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.estimated_average_ticket
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {/* {errors.estimated_average_ticket && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.estimated_average_ticket[0]}
                    </p>
                  )} */}
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estimated Highest ticket you will process
                </label>
                <input
                  type="text"
                  required
                  name="estimated_highest_ticket"
                  value={formData.estimated_highest_ticket}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Types
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-700">
                      Card Present / Swiped
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        required
                        min="0"
                        max="100"
                        name="transaction_card_present"
                        value={formData.transaction_card_present}
                        onChange={handleInputChange}
                        className="w-full accent-green-400"
                      />
                      <span className="text-gray-700 w-8 text-right">
                        {formData.transaction_card_present || 0}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700">Keyed In</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        required
                        max="100"
                        name="transaction_keyed_in"
                        value={formData.transaction_keyed_in}
                        onChange={handleInputChange}
                        className="w-full accent-green-400"
                      />
                      <span className="text-gray-700 w-8 text-right">
                        {formData.transaction_keyed_in || 0}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700">
                      All Online
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        required
                        name="transaction_all_online"
                        value={formData.transaction_all_online}
                        onChange={handleInputChange}
                        className="w-full accent-green-400"
                      />
                      <span className="text-gray-700 w-8 text-right">
                        {formData.transaction_all_online || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto Settle / Batch time (Next day funding cutoff time is 8 pm
                  CST)
                </label>
                <input
                  type="time"
                  required
                  name="auto_settle_time"
                  value={formData.auto_settle_time}
                  onChange={handleInputChange}
                  className="w-40 rounded-md border-gray-300"
                />
              </div>
              <div className="flex flex-col gap-1 mt-2 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  I do not need Auto Settle
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="auto_settle_type"
                    name="auto_settle_type"
                    checked={formData.auto_settle_type === "auto"}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      auto_settle_type: e.target.checked ? "auto" : "manual"
                    }))}
                    className="h-4 w-4 border-gray-300 text-tracer-green focus:ring-tracer-green"
                  />
                  <label htmlFor="auto_settle_type" className="text-sm text-gray-700 select-none">
                    I will Settle / Batch myself
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-2 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Tips to my account
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="add_tips_to_account"
                    name="add_tips_to_account"
                    checked={formData.add_tips_to_account === "yes"}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      add_tips_to_account: e.target.checked ? "yes" : "no"
                    }))}
                    className="h-4 w-4 border-gray-300 text-tracer-green focus:ring-tracer-green"
                  />
                  <label htmlFor="add_tips_to_account" className="text-sm text-gray-700 select-none">
                    I would like to have the tip function added to my account
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Tip Amounts to be added to the receipts
                </label>
                <div className="flex flex-col gap-2">
                  {["15%", "18%", "20%", "25%"].map((tip) => (
                    <label
                      key={tip}
                      className="inline-flex items-center text-gray-700"
                    >
                      <input
                        type="checkbox"
                        name="tip_amounts"
                        value={tip}
                        checked={formData.tip_amounts.includes(tip)}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 border-gray-300 text-tracer-green focus:ring-tracer-green"
                      />
                      {tip}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            <legend className="text-lg font-semibold text-gray-800 px-2">
              Signature
              <span className="ml-2 text-sm text-red-400 font-normal">
                (*Required)
              </span>
            </legend>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="signature_date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="signature_date"
                    required
                    name="signature_date"
                    value={formData.signature_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded border-gray-300 focus:border-tracer-green focus:ring-tracer-green px-3 py-2"
                  />
                  <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {/* {errors.signature_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.signature_date[0]}
                  </p>
                )} */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature
                </label>
                <div className="border border-gray-300 rounded p-2">
                  <SignaturePad
                    ref={signatureRef}
                    canvasProps={{
                      className: "w-full h-40 bg-white rounded",
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="mt-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  Clear Signature
                </button>
                {errors.signature && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.signature[0]}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 bg-tracer-green text-white rounded-lg font-semibold flex items-center space-x-2
                ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-tracer-green/90"
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Form</span>
              )}
            </button>
          </div>
        </form>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
