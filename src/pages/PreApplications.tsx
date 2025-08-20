import React, { useEffect, useState } from "react";
import {
  FormInput,
  Eye,
  Loader2,
  X,
  Copy,
  CheckCircle,
  ExternalLink,
  Send,
  Copy as Duplicate,
  Trash2,
  Download,
  SpaceIcon,
  FileText,
  Image,
  File,
  Mail,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PreAppDetailsPDF from "../components/PreAppDetailsPDF";
import ReactDOM from "react-dom";

interface FormData {
  id: number;
  status: number;
  dba: string; // Adding dba field
  mail_status: number; // Adding mail_status field
  business_dba: string;
  business_legal_name: string;
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
  business_profile_business_type: string | string[];
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
  business_type: string | string[];
  business_type_other: string;
  processing_services: string | string[];
  terminal: string | string[];
  terminal_special_features: string;
  terminal_type_or_model: string;
  mobile_app: string | string[];
  mobile_app_special_features: string;
  mobile_app_cardreader_type_model: string;
  pos_point_of_sale: string | string[];
  pos_special_features: string;
  system_type_model: string;
  number_of_stations: string;
  pos_other_items: string;
  virtual_terminal: string | string[];
  signature_date: string;
  signature: string;
  personal_guarantee_required: string;
  clear_signature: string;
  is_same_shipping_address: string;
  iso_form_status: number;
  merchant_name: string;
  email: string;
  phone: string;

  // Additional fields from API response
  get_jotform_details?: Array<{
    dba_street_address: string;
    business_legal_name: string;
    dba_street_address2?: string;
    corporate_street_address1: string;
    corporate_street_address2?: string;
    corporate_city?: string;
    corporate_state?: string;
    corporate_zip?: string;
    business_location_phone_number: string;
    business_contact_mail: string;
    business_website: string;
    location_description: string;
    business_products_sold: string;
    business_return_policy: string;
    transaction_card_present: string;
    transaction_keyed_in: string;
    transaction_all_online: string;
    estimated_average_ticket: string;
    estimated_highest_ticket: string;
    estimation_early_master_card: string;
    auto_settle_time: string;
    auto_settle_type: string;
    add_tips_to_account: string;
    tip_amounts: string;
  }>;
  get_jotform_docs?: Array<{
    id: number;
    file_original_name: string;
    file_path: string;
    uploaded_at: string;
  }>;
  get_jotform_owner_docs?: Array<{
    id: number;
    ownership_first_name: string;
    ownership_last_name: string;
    ownership_title: string;
    ownership_percent: string;
    ownership_phone_number: string;
    ownership_email: string;
    ownership_dob: string;
    ownership_social_security_number: string;
    ownership_driver_licence_number: string;
  }>;
  created_at?: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: FormData[];
  errors?: { [key: string]: string[] };
}

interface FormDetailsResponse {
  status: string;
  message: string;
  data: FormData[];
  errors?: { [key: string]: string[] };
}

interface FormDetailsModalProps {
  form: FormData | null;
  onClose: () => void;
}

interface DuplicateFormModalProps {
  form: FormData | null;
  onClose: () => void;
}

function FormDetailsModal({ form, onClose }: FormDetailsModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [guaranteeRequired, setGuaranteeRequired] = useState("yes"); // default selected
  const [signatureType, setSignatureType] = useState("clearance"); // default selected
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState(null);

  // Helper function to get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Image className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const localStoregeAuth = localStorage.getItem("auth_user");
  const localStoregeAuthParsedUser = localStoregeAuth ? JSON.parse(localStoregeAuth) : null;
  const localStoregeUserRole = localStoregeAuthParsedUser.role_id;

  // Helper function to check if file is an image
  const isImageFile = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif"].includes(ext || "");
  };

  const handleDownload = async (file: { id: number; file_original_name: string; file_path: string; uploaded_at: string }) => {
    try {
      setIsDownloading(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/file/download/${file.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = file.file_original_name; // Use the original filename

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);

      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const value = localStorage.getItem("auth_user");
    const parsedUser = value ? JSON.parse(value) : null;

    console.log(guaranteeRequired, email, signatureType);

    const formDataToSubmit = {
      user_id: parsedUser.id.toString(),
      form_id: form?.id.toString(),
      personal_guarantee_required: guaranteeRequired,
      clear_signature: signatureType,
      email: email,
    };

    setLoading(true); // use loading here
    try {
      const accessToken = localStorage.getItem("auth_token");
      if (!accessToken) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/clear-signature-mail`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formDataToSubmit),
        }
      );

      const responseData = await response.json();
      console.log("Duplicate form response:", responseData);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          navigate("/login");
          throw new Error("Session expired. Please login again.");
        }
        if (response.status === 404) {
          throw new Error("API endpoint not found. Please contact support.");
        }
        if (response.status === 422 && responseData.errors) {
          const validationErrors = responseData.errors as {
            [key: string]: string[];
          };
          Object.values(validationErrors).forEach((errors: string[]) => {
            errors.forEach((error) => toast.error(error));
          });
          throw new Error("Validation failed");
        }
        throw new Error(responseData.message || "Failed to duplicate form");
      }

      toast.success("We've sent you an email to clear e-signature!");
      onClose();
    } catch (error) {
      console.error("Error to send mail clear e-signature:", error);
      if (error instanceof Error) {
        if (error.message.includes("Session expired")) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else if (error.message.includes("API endpoint not found")) {
          toast.error("API endpoint not found. Please contact support.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false); // stop loader
    }
  };

  if (!form) return null;

  const isChecked = (array: string | string[] | undefined, value: string) => {
    if (!array) return false;
    let parsedArray: string[] = [];
    if (typeof array === "string") {
      try {
        const parsed = JSON.parse(array);
        if (Array.isArray(parsed)) {
          parsedArray = parsed;
        } else {
          return false;
        }
      } catch {
        return false;
      }
    } else if (Array.isArray(array)) {
      parsedArray = array;
    } else {
      return false;
    }
    return parsedArray.includes(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-8 max-w-3xl w-full mx-4 relative max-h-[90vh] overflow-y-auto border border-tracer-blue/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-tracer-green transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-tracer-green">Form Details</h2>
          <div className="mt-2 h-1 w-24 bg-tracer-green mx-auto rounded-full"></div>
        </div>

        <div className="space-y-8">
          {/* Business Information */}
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-tracer-green mb-4">
              Business Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  DBA(Doing Business As)
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.business_dba || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Street Address
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.dba_street_address || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Street Address Line 2
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.dba_street_address2 || "-"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    City
                  </label>
                  <p className="mt-1 text-white font-medium">
                    {form.business_city || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    State
                  </label>
                  <p className="mt-1 text-white font-medium">
                    {form.business_state || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    ZIP
                  </label>
                  <p className="mt-1 text-white font-medium">
                    {form.business_zip || "-"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Business Type
                </label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {[
                    { value: "LLC", label: "LLC" },
                    { value: "Corp", label: "Corp" },
                    { value: "Non-Profit", label: "Non-Profit" },
                    { value: "Sole Prop", label: "Sole Prop" },
                    { value: "Gov", label: "Gov" },
                    {
                      value: "Association/Estate/Trust",
                      label: "Association/Estate/Trust",
                    },
                    { value: "Other", label: "Other" },
                  ].map(({ value, label }) => (
                    <span
                      key={value}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isChecked(form.business_profile_business_type, value)
                          ? "bg-tracer-green text-black"
                          : "bg-zinc-700 text-gray-400"
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Shipping Address
                  </label>

                  {/* Radio Button: checked if shipping_address === '1' */}
                  <div className="mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="shipping_address"
                        value="1"
                        checked={form.is_same_shipping_address === "1"}
                        readOnly
                        className="form-radio text-tracer-green"
                      />
                      <span className="ml-2 text-white">
                        Shipping Address (
                        {form.is_same_shipping_address === "1" ? "Yes" : form.is_same_shipping_address === "0" ? "No" : "-"})
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-tracer-green mb-4">
              Corporate Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Street Address
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.corporate_street_address1 || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Street Address Line 2
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.corporate_street_address2 || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Street Address Line 2
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.dba_street_address2 || "-"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    City
                  </label>
                  <p className="mt-1 text-white font-medium">
                    {form.get_jotform_details?.[0]?.corporate_city || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    State
                  </label>
                  <p className="mt-1 text-white font-medium">
                    {form.get_jotform_details?.[0]?.corporate_state || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    ZIP
                  </label>
                  <p className="mt-1 text-white font-medium">
                    {form.get_jotform_details?.[0]?.corporate_zip || "-"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Contact Name
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.business_contact_name || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Contact Email
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.business_contact_mail || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Location Phone Number
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.business_location_phone_number || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Date Business Started
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.business_start_date || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Business Website
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.business_website || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Business Legal Name as appears on tax return
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.business_legal_name || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Federal Tax ID
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.business_tax_id || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Products Sold or Services Provided
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.business_products_sold || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Return Policy
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.business_return_policy || "-"}
                </p>
              </div>
            </div>
          </div>

          {Array.isArray(form.get_jotform_owner_docs) &&
            form.get_jotform_owner_docs.length > 0 &&
            form.get_jotform_owner_docs.map((owner, index) => (
              <div
                key={index}
                id={`owner-officer-section-${index}`}
                className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 mb-6"
              >
                <h3 className="text-lg font-semibold text-tracer-green mb-4">
                  Owner / Officer Information {index + 1}
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {owner.ownership_first_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        First Name
                      </label>
                      <p className="mt-1 text-white font-medium">
                        {owner.ownership_first_name}
                      </p>
                    </div>
                  )}

                  {owner.ownership_last_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Last Name
                      </label>
                      <p className="mt-1 text-white font-medium">
                        {owner.ownership_last_name}
                      </p>
                    </div>
                  )}

                  {owner.ownership_percent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Ownership Percent
                      </label>
                      <p className="mt-1 text-white font-medium">
                        {owner.ownership_percent}%
                      </p>
                    </div>
                  )}

                  {owner.ownership_phone_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Phone Number
                      </label>
                      <p className="mt-1 text-white font-medium">
                        {owner.ownership_phone_number}
                      </p>
                    </div>
                  )}

                  {owner.ownership_email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Email
                      </label>
                      <p className="mt-1 text-white font-medium">
                        {owner.ownership_email}
                      </p>
                    </div>
                  )}

                  {owner.ownership_dob && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Date of Birth
                      </label>
                      <p className="mt-1 text-white font-medium">
                        {owner.ownership_dob}
                      </p>
                    </div>
                  )}

                  {owner.ownership_social_security_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Social Security Number
                      </label>
                      <p className="mt-1 text-white font-medium">
                        {owner.ownership_social_security_number}
                      </p>
                    </div>
                  )}

                  {owner.ownership_driver_licence_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Driver License Number
                      </label>
                      <p className="mt-1 text-white font-medium">
                        {owner.ownership_driver_licence_number}
                      </p>
                    </div>
                  )}

                  {owner.ownership_title && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Title
                      </label>
                      <p className="mt-1 text-white font-medium">
                        {owner.ownership_title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

          {/* Additional Business Details
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-tracer-blue mb-4">Additional Business Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400">Business Website</label>
                <p className="mt-1 text-white font-medium">{form.get_jotform_details?.[0]?.business_website}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Location Description</label>
                <p className="mt-1 text-white font-medium">{form.get_jotform_details?.[0]?.location_description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Products Sold</label>
                <p className="mt-1 text-white font-medium">{form.get_jotform_details?.[0]?.business_products_sold}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Return Policy</label>
                <p className="mt-1 text-white font-medium">{form.get_jotform_details?.[0]?.business_return_policy}</p>
              </div>
            </div>
          </div> */}

          {/* Transaction Details */}
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-tracer-green mb-4">
              Credit Card Processing Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Card Present Transactions
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.transaction_card_present}%
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Keyed-in Transactions
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.transaction_keyed_in}%
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Online Transactions
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.transaction_all_online}%
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Average Ticket
                </label>
                <p className="mt-1 text-white font-medium">
                  ${form.get_jotform_details?.[0]?.estimated_average_ticket}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Highest Ticket
                </label>
                <p className="mt-1 text-white font-medium">
                  ${form.get_jotform_details?.[0]?.estimated_highest_ticket}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Early Mastercard
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.estimation_early_master_card}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Auto Settle / Batch time (Next day funding cutoff time is 8 pm
                  CST)
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.auto_settle_time}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  I do not need Auto Settle
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.auto_settle_type}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  {" "}
                  Add Tips to my account
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.get_jotform_details?.[0]?.add_tips_to_account}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Tip Amounts
                </label>
                <div className="flex gap-2 mt-1">
                  {JSON.parse(
                    form.get_jotform_details?.[0]?.tip_amounts || "[]"
                  ).map((tip: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-zinc-700 text-white rounded-full text-sm"
                    >
                      {tip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Settlement Details */}
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-tracer-green mb-4">
              Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Business Type
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.business_type}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Processing Services
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.processing_services}
                </p>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-400">
                  Terminal
                </label>
                <p className="mt-1 text-white font-medium">{form.terminal}</p>
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Terminal
                </label>
                <p className="mt-1 text-white font-medium">{form.terminal}</p>
              </div>

              {form.terminal_special_features && (
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Terminal Other
                  </label>
                  <p className="mt-1 text-white font-medium">
                    {form.terminal_special_features}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Terminal Type/Model
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.terminal_type_or_model}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Mobile App
                </label>
                <p className="mt-1 text-white font-medium">{form.mobile_app}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Mobile App Special Features (Optional)
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.mobile_app_special_features}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Cardreader Type/Model
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.mobile_app_cardreader_type_model}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  {" "}
                  POS (Point of Sale) System
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.pos_point_of_sale}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  POS Special Features
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.pos_special_features}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  System Type Model
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.system_type_model}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Number of Stations
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.number_of_stations}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  POS other items
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.pos_other_items}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Virtual Terminal
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.virtual_terminal}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Location Description
                </label>
                {form.get_jotform_details?.[0]?.location_description && (
                  <p className="mt-1 text-white font-medium">
                    {form.get_jotform_details[0].location_description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-tracer-green mb-4">
              Documents
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium text-gray-300 mb-2">
                  Business Documents
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {form.get_jotform_docs?.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 bg-zinc-700 rounded-lg"
                    >
                      {isImageFile(doc.file_original_name) ? (
                        <img
                          src={`${import.meta.env.VITE_IMAGE_URL}${
                            doc.file_path
                          }`}
                          alt={doc.file_original_name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        getFileIcon(doc.file_original_name)
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {doc.file_original_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {doc.uploaded_at}
                        </p>
                      </div>
                      <a
                        href="#"
                        download
                        className="text-tracer-green hover:text-tracer-blue flex items-center gap-1"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-5 w-5" />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* <div>
                <h4 className="text-md font-medium text-gray-300 mb-2">Owner Documents</h4>
                <div className="grid grid-cols-2 gap-4">
                  {form.get_jotform_owner_docs?.map((owner) => (
                    <div key={owner.id} className="p-3 bg-zinc-700 rounded-lg">
                      <p className="text-sm text-white">Name: {owner.ownership_first_name} {owner.ownership_last_name}</p>
                      <p className="text-sm text-white">Title: {owner.ownership_title}</p>
                      <p className="text-sm text-white">Ownership: {owner.ownership_percent}%</p>
                      <p className="text-sm text-white">Phone: {owner.ownership_phone_number}</p>
                      <p className="text-sm text-white">Email: {owner.ownership_email}</p>
                      <p className="text-sm text-white">DOB: {owner.ownership_dob}</p>
                      <p className="text-sm text-white">SSN: {owner.ownership_social_security_number}</p>
                      <p className="text-sm text-white">DL: {owner.ownership_driver_licence_number}</p>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>
          </div>

          {/* Signature Section */}
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-tracer-green mb-4">Signature</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Date
                </label>
                <p className="mt-1 text-white font-medium">
                  {form.signature_date}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Signature
                </label>
                {form.signature ? (
                  <div className="mt-1 bg-white rounded-lg p-4">
                    <img
                      src={form.signature}
                      alt="Signature"
                      className="max-w-full h-auto mx-auto"
                    />
                  </div>
                ) : (
                  <div className="mt-1 bg-zinc-700 rounded-lg p-4 text-gray-400 text-center">
                    No signature available
                  </div>
                )}
              </div>
            </div>
          </div>

          {(localStoregeUserRole === 1 || localStoregeUserRole === 2) && (
          
          <form onSubmit={handleEmailSend}>
            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h3 className="text-tracer-green mb-4">Clear E-Signature</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Personal Guarantee Required
                </label>
                <select
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-700 text-white px-3 py-2"
                  value={guaranteeRequired}
                  onChange={(e) => setGuaranteeRequired(e.target.value)}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Signature
                  </label>
                  <select
                    className="w-full rounded-lg border border-zinc-600 mt-2 bg-zinc-700 text-white px-3 py-2"
                    value={signatureType}
                    onChange={(e) => setSignatureType(e.target.value)}
                  >
                    <option value="clearance">clearance</option>
                    <option value="e-signature">e-signature clear</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-700 text-white px-3 py-2"
                  placeholder="Enter email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`bg-tracer-green hover:bg-tracer-green/90 text-white font-semibold px-6 py-2 rounded-lg flex items-center justify-center gap-2 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading && (
                  <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                )}
                {loading ? "Sending..." : "Send Email"}
              </button>
            </div>
          </form>

            
          )}

        </div>
      </div>
    </div>
  );
}

function DuplicateFormModal({ form, onClose }: DuplicateFormModalProps) {
  const [prospectEmail, setProspectEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const parseArrayField = (value: any) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      return [];
    }
  };

  const isChecked = (array: string | string[] | undefined, value: string) => {
    if (!array) return false;
    let parsedArray: string[] = [];
    if (typeof array === "string") {
      try {
        const parsed = JSON.parse(array);
        if (Array.isArray(parsed)) {
          parsedArray = parsed;
        } else {
          return false;
        }
      } catch {
        return false;
      }
    } else if (Array.isArray(array)) {
      parsedArray = array;
    } else {
      return false;
    }
    return parsedArray.includes(value);
  };

  const value = localStorage.getItem("auth_user");
  const parsedUser = value ? JSON.parse(value) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectEmail) {
      toast.error("Please enter prospect email");
      return;
    }

    const formDataToSubmit = {
      email: prospectEmail,
      user_id: parsedUser.id.toString(),
      is_duplicate: "1",
      business_profile_business_type: parseArrayField(
        form?.business_profile_business_type
      ),
      business_type: parseArrayField(form?.business_type),
      processing_services: parseArrayField(form?.processing_services),
      terminal: parseArrayField(form?.terminal),
      mobile_app: parseArrayField(form?.mobile_app),
      pos_point_of_sale: parseArrayField(form?.pos_point_of_sale),
      virtual_terminal: parseArrayField(form?.virtual_terminal),
      business_dba: form?.business_dba || "",
      business_corporate_address: form?.business_corporate_address || "",
      business_location_address: form?.business_location_address || "",
      business_city: form?.business_city || "",
      business_state: form?.business_state || "",
      business_zip: form?.business_zip || "",
      business_phone_number: form?.business_phone_number || "",
      business_contact_name: form?.business_contact_name || "",
      business_contact_number: form?.business_contact_number || "",
      business_start_date: form?.business_start_date || "",
      business_tax_id: form?.business_tax_id || "",
      ownership_owner_name: form?.ownership_owner_name || "",
      ownership_title: form?.ownership_title || "",
      ownership_percent: form?.ownership_percent || "",
      ownership_phone_number: form?.ownership_phone_number || "",
      ownership_city: form?.ownership_city || "",
      ownership_state: form?.ownership_state || "",
      ownership_zip: form?.ownership_zip || "",
      ownership_email: form?.ownership_email || "",
      ownership_dob: form?.ownership_dob || "",
      ownership_social_security_number:
        form?.ownership_social_security_number || "",
      ownership_residential_street_address:
        form?.ownership_residential_street_address || "",
      ownership_driver_licence_number:
        form?.ownership_driver_licence_number || "",
      bank_name: form?.bank_name || "",
      aba_routing: form?.aba_routing || "",
      doa: form?.doa || "",
      business_type_other: form?.business_type_other || "",
      terminal_special_features: form?.terminal_special_features || "",
      terminal_type_or_model: form?.terminal_type_or_model || "",
      mobile_app_special_features: form?.mobile_app_special_features || "",
      mobile_app_cardreader_type_model:
        form?.mobile_app_cardreader_type_model || "",
      pos_special_features: form?.pos_special_features || "",
      system_type_model: form?.system_type_model || "",
      number_of_stations: form?.number_of_stations || "",
      pos_other_items: form?.pos_other_items || "",
    };

    console.log("Form data to submit:", formDataToSubmit);

    setIsSubmitting(true);
    try {
      const accessToken = localStorage.getItem("auth_token");
      if (!accessToken) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/duplicate-form-send-mail`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formDataToSubmit),
        }
      );

      const responseData = await response.json();
      console.log("Duplicate form response:", responseData);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          navigate("/login");
          throw new Error("Session expired. Please login again.");
        }
        if (response.status === 404) {
          throw new Error("API endpoint not found. Please contact support.");
        }
        if (response.status === 422 && responseData.errors) {
          const validationErrors = responseData.errors as {
            [key: string]: string[];
          };
          Object.values(validationErrors).forEach((errors: string[]) => {
            errors.forEach((error) => toast.error(error));
          });
          throw new Error("Validation failed");
        }
        throw new Error(responseData.message || "Failed to duplicate form");
      }

      toast.success("We've sent you an email to duplicate the form!");
      onClose();
    } catch (error) {
      console.error("Error duplicating form:", error);
      if (error instanceof Error) {
        if (error.message.includes("Session expired")) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else if (error.message.includes("API endpoint not found")) {
          toast.error("API endpoint not found. Please contact support.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-tracer-green rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black">
              Merchant Pre-Application
            </h2>
            <button
              onClick={onClose}
              className="text-black hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-black/80 text-sm">Tracer C2 Financial Services</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BUSINESS PROFILE */}
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              BUSINESS PROFILE
            </h3>
            <input type="hidden" name="is_duplicate" value="1" />
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Doing Business As (DBA)
                </label>
                <input
                  type="text"
                  name="business_dba"
                  value={form?.business_dba || ""}
                  readOnly
                  className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Corporate Legal Name
                </label>
                <input
                  type="text"
                  name="business_corporate_legal_name"
                  value={form?.business_corporate_legal_name || ""}
                  readOnly
                  className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Location Address
                </label>
                <input
                  type="text"
                  name="business_location_address"
                  value={form?.business_location_address || ""}
                  readOnly
                  className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Corporate Address (if different)
                </label>
                <input
                  type="text"
                  name="business_corporate_address"
                  value={form?.business_corporate_address || ""}
                  readOnly
                  className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    City
                  </label>
                  <input
                    type="text"
                    name="business_city"
                    value={form?.business_city || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    State
                  </label>
                  <input
                    type="text"
                    name="business_state"
                    value={form?.business_state || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    ZIP
                  </label>
                  <input
                    type="text"
                    name="business_zip"
                    value={form?.business_zip || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Business Phone Number
                  </label>
                  <input
                    type="text"
                    name="business_phone_number"
                    value={form?.business_phone_number || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="business_contact_name"
                    value={form?.business_contact_name || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="business_contact_number"
                    value={form?.business_contact_number || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Date
                  </label>
                  <input
                    type="text"
                    name="business_start_date"
                    value={form?.business_start_date || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Federal Tax ID
                  </label>
                  <input
                    type="text"
                    name="business_tax_id"
                    value={form?.business_tax_id || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Business Type
                </label>
                <div className="flex flex-wrap gap-4 mt-2 bg-zinc-700 p-4 rounded-md">
                  {[
                    { value: "corporation", label: "Corporation" },
                    { value: "partnership", label: "Partnership" },
                    { value: "llc", label: "LLC" },
                    { value: "sole_proprietor", label: "Sole Proprietor" },
                    { value: "non_profit", label: "Non For Profit" },
                  ].map(({ value, label }) => (
                    <label key={value} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={value}
                        disabled
                        name="business_profile_business_type[]"
                        checked={isChecked(
                          form?.business_profile_business_type,
                          value
                        )}
                        className="h-4 w-4 rounded border-zinc-600 text-tracer-green focus:ring-tracer-green bg-zinc-600 cursor-not-allowed"
                      />
                      <span className="ml-2 text-white">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* OWNERSHIP */}
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">OWNERSHIP</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    name="ownership_owner_name"
                    value={form?.ownership_owner_name || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    name="ownership_title"
                    value={form?.ownership_title || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Ownership %
                  </label>
                  <input
                    type="text"
                    name="ownership_percent"
                    value={form?.ownership_percent || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="ownership_phone_number"
                    value={form?.ownership_phone_number || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    City
                  </label>
                  <input
                    type="text"
                    name="ownership_city"
                    value={form?.ownership_city || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    State
                  </label>
                  <input
                    type="text"
                    name="ownership_state"
                    value={form?.ownership_state || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    ZIP
                  </label>
                  <input
                    type="text"
                    name="ownership_zip"
                    value={form?.ownership_zip || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="text"
                  name="ownership_email"
                  value={form?.ownership_email || ""}
                  readOnly
                  className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    name="ownership_dob"
                    value={form?.ownership_dob || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Social Security Number
                  </label>
                  <input
                    type="text"
                    name="ownership_social_security_number"
                    value={form?.ownership_social_security_number || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Residential Street Address
                  </label>
                  <input
                    type="text"
                    name="ownership_residential_street_address"
                    value={form?.ownership_residential_street_address || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Driver License Number
                  </label>
                  <input
                    type="text"
                    name="ownership_driver_licence_number"
                    value={form?.ownership_driver_licence_number || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BANKING INFORMATION */}
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              BANKING INFORMATION
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={form?.bank_name || ""}
                  readOnly
                  className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  ABA Routing
                </label>
                <input
                  type="text"
                  name="aba_routing"
                  value={form?.aba_routing || ""}
                  readOnly
                  className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  DOA
                </label>
                <input
                  type="text"
                  name="doa"
                  value={form?.doa || ""}
                  readOnly
                  className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* BUSINESS TYPE */}
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              BUSINESS TYPE
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Business Type
                </label>
                <div className="flex flex-wrap gap-4 mt-2 bg-zinc-700 p-4 rounded-md">
                  {[
                    { value: "retail", label: "Retail" },
                    { value: "hospitality", label: "Hospitality" },
                    { value: "services", label: "Services" },
                    { value: "b2b", label: "B2B" },
                  ].map(({ value, label }) => (
                    <label key={value} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={value}
                        name="business_type[]"
                        disabled
                        checked={isChecked(form?.business_type, value)}
                        className="h-4 w-4 rounded border-zinc-600 text-tracer-green focus:ring-tracer-green bg-zinc-600 cursor-not-allowed"
                      />
                      <span className="ml-2 text-white">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Others (Optional)
                </label>
                <input
                  type="text"
                  name="business_type_other"
                  value={form?.business_type_other || ""}
                  readOnly
                  className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* PROCESSING SERVICES */}
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              PROCESSING SERVICES
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Processing Services
              </label>
              <div className="flex flex-wrap gap-4 mt-2 bg-zinc-700 p-4 rounded-md">
                {[
                  {
                    value: "traditional_processing",
                    label: "Traditional Processing",
                  },
                  { value: "surcharging", label: "Surcharging" },
                  { value: "qr_code", label: "QR Code" },
                  { value: "check_services", label: "Check Services" },
                  {
                    value: "qb_or_software_integration",
                    label: "QB/Software Integration",
                  },
                  { value: "cash_discounting", label: "Cash Discounting" },
                  { value: "online_ordering", label: "Online Ordering(OLO)" },
                  { value: "gift_cards", label: "Gift Cards" },
                  { value: "invoice_manager", label: "Invoice Manager" },
                ].map(({ value, label }) => (
                  <label key={value} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={value}
                      disabled
                      name="processing_services[]"
                      checked={isChecked(form?.processing_services, value)}
                      className="h-4 w-4 rounded border-zinc-600 text-tracer-green focus:ring-tracer-green bg-zinc-600 cursor-not-allowed"
                    />
                    <span className="ml-2 text-white">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* PROCESSING HARDWARE */}
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              PROCESSING HARDWARE
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Terminal
                </label>
                <div className="flex flex-wrap gap-4 mt-2 bg-zinc-700 p-4 rounded-md">
                  {[
                    { value: "dial", label: "Dial" },
                    { value: "ip", label: "IP" },
                    { value: "wifi", label: "WIFI" },
                    { value: "4g", label: "4G" },
                  ].map(({ value, label }) => (
                    <label key={value} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={value}
                        disabled
                        name="terminal[]"
                        checked={isChecked(form?.terminal, value)}
                        className="h-4 w-4 rounded border-zinc-600 text-tracer-green focus:ring-tracer-green bg-zinc-600 cursor-not-allowed"
                      />
                      <span className="ml-2 text-white">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Terminal Special Features (Optional)
                  </label>
                  <input
                    type="text"
                    name="terminal_special_features"
                    value={form?.terminal_special_features || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Terminal Type/Model
                  </label>
                  <input
                    type="text"
                    name="terminal_type_or_model"
                    value={form?.terminal_type_or_model || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Mobile App
                </label>
                <div className="flex flex-wrap gap-4 mt-2 bg-zinc-700 p-4 rounded-md">
                  {[
                    { value: "ios", label: "IOS" },
                    { value: "android", label: "Android" },
                  ].map(({ value, label }) => (
                    <label key={value} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={value}
                        disabled
                        name="mobile_app[]"
                        checked={isChecked(form?.mobile_app, value)}
                        className="h-4 w-4 rounded border-zinc-600 text-tracer-green focus:ring-tracer-green bg-zinc-600 cursor-not-allowed"
                      />
                      <span className="ml-2 text-white">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Mobile App Special Features (Optional)
                </label>
                <input
                  type="text"
                  name="mobile_app_special_features"
                  value={form?.mobile_app_special_features || ""}
                  readOnly
                  className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Cardreader Type/Model
                </label>
                <input
                  type="text"
                  name="mobile_app_cardreader_type_model"
                  value={form?.mobile_app_cardreader_type_model || ""}
                  readOnly
                  className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  POS(Point of Sale) System
                </label>
                <div className="flex flex-wrap gap-4 mt-2 bg-zinc-700 p-4 rounded-md">
                  {[
                    { value: "ios", label: "IOS" },
                    { value: "android", label: "Android" },
                    { value: "windows_or_pc", label: "Windows/PC" },
                  ].map(({ value, label }) => (
                    <label key={value} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={value}
                        name="pos_point_of_sale[]"
                        disabled
                        checked={isChecked(form?.pos_point_of_sale, value)}
                        className="h-4 w-4 rounded border-zinc-600 text-tracer-green focus:ring-tracer-green bg-zinc-600 cursor-not-allowed"
                      />
                      <span className="ml-2 text-white">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    POS Special Features
                  </label>
                  <input
                    type="text"
                    name="pos_special_features"
                    value={form?.pos_special_features || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    System Type Model
                  </label>
                  <input
                    type="text"
                    name="system_type_model"
                    value={form?.system_type_model || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Number of Stations
                  </label>
                  <input
                    type="text"
                    name="number_of_stations"
                    value={form?.number_of_stations || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    POS other items
                  </label>
                  <input
                    type="text"
                    name="pos_other_items"
                    value={form?.pos_other_items || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Virtual Terminal
                </label>
                <div className="flex flex-wrap gap-4 mt-2 bg-zinc-700 p-4 rounded-md">
                  {[
                    {
                      value: "test_or_email_link_to_pay",
                      label: "Text/Email Link to Pay",
                    },
                    {
                      value: "hot_button",
                      label: "Hot Button on Web Pay Now/Donate Now",
                    },
                    {
                      value: "cnp_cash_discount",
                      label: "CNP Cash Discount/Surcharge",
                    },
                    { value: "text_notification", label: "Text Notification" },
                  ].map(({ value, label }) => (
                    <label key={value} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={value}
                        disabled
                        name="virtual_terminal[]"
                        checked={isChecked(form?.virtual_terminal, value)}
                        className="h-4 w-4 rounded border-zinc-600 text-tracer-green focus:ring-tracer-green bg-zinc-600 cursor-not-allowed"
                      />
                      <span className="ml-2 text-white">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Prospect Email Section */}
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Prospect Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Prospect Email *
              </label>
              <input
                type="email"
                value={prospectEmail}
                onChange={(e) => setProspectEmail(e.target.value)}
                required
                name="email"
                className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white focus:border-tracer-green focus:ring-tracer-green"
                placeholder="Enter prospect email"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white bg-tracer-green rounded-md hover:bg-tracer-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tracer-green ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Duplicating..." : "Submit Form"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PreApplications() {
  const [forms, setForms] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [user, setUser] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteRep, setSelectedDeleteRep] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formToken, setFormToken] = useState<string>("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadingPDFId, setDownloadingPDFId] = useState<number | null>(null);

  console.log('forms',forms);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    dba: "",
    merchantName: "",
    email: "",
    phone: "",
  });
  const [emailSending, setEmailSending] = useState(false);

  // const preAppLink = `${window.location.origin}/iso-forms?data=${formToken}`; // The base URL for your form
  const value = localStorage.getItem("auth_user");
  const parsedUser = value ? JSON.parse(value) : null;
  const first_name = parsedUser.first_name;
  const last_name = parsedUser.last_name;
  const full_name = `${first_name} ${last_name}`
  .toLowerCase()                    // Convert to lowercase
  .replace(/\s+/g, '-');    
  const user_id =   parsedUser.id; 
  
  const preAppLink = `${window.location.origin}/iso-forms/${encodeURIComponent(full_name)}/${user_id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(preAppLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link");
    }
  };

  useEffect(() => {
    fetchForms();
    // fetchFormToken();
  }, []);

  const fetchForms = async (id?: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token");
      const value = localStorage.getItem("auth_user");
      const parsedUser = value ? JSON.parse(value) : null;
      setUser(parsedUser);

      let body = undefined;

      // Add user_id to body only if role is NOT 1 or 2
      //  if ((parsedUser && parsedUser.role_id !== 1)) {
      if (parsedUser && parsedUser.role_id !== 1 && parsedUser.role_id !== 2) {
        body = JSON.stringify({ user_id: parsedUser.id });
      }
      // console.log(body,'body');

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/jotform/lists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: body,
        }
      );

      const responseData: ApiResponse = await response.json();

      console.log(responseData);

      if (!response.ok) {
        if (response.status === 422) {
          setErrors(responseData.errors || {});
          Object.keys(responseData.errors || {}).forEach((key) => {
            responseData.errors?.[key].forEach((errorMsg: string) => {
              toast.error(errorMsg);
            });
          });
        } else if (response.status === 401) {
          localStorage.removeItem("auth_token");
          toast.error("Session expired. Please login again");
          navigate("/login");
        } else {
          throw new Error(responseData.message || "Form submission failed");
        }
        return;
      }

      if (responseData.status === "error") {
        throw new Error(responseData.message || "Failed to fetch forms");
      }

      setForms(responseData.data || []);
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load pre-applications"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFormToken = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token");
      const value = localStorage.getItem("auth_user");
      const parsedUser = value ? JSON.parse(value) : null;
      setUser(parsedUser);

      let body = undefined;
      body = JSON.stringify({ user_id: parsedUser.id });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/generate-form-token`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: body,
        }
      );

      const responseData: ApiResponse = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          setErrors(responseData.errors || {});
          Object.keys(responseData.errors || {}).forEach((key) => {
            responseData.errors?.[key].forEach((errorMsg: string) => {
              toast.error(errorMsg);
            });
          });
        } else if (response.status === 401) {
          localStorage.removeItem("auth_token");
          toast.error("Session expired. Please login again");
          navigate("/login");
        } else {
          throw new Error(responseData.message || "Form submission failed");
        }
        return;
      }

      if (responseData.status === "error") {
        throw new Error(responseData.message || "Failed to fetch forms");
      }
      // setFormToken(responseData.data);
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load pre-applications"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFormDetails = async (id: number) => {
    try {
      setIsLoadingDetails(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/jotform/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseData: FormDetailsResponse = await response.json();

      console.log(responseData, "responseData");

      if (!response.ok) {
        if (response.status === 422) {
          setErrors(responseData.errors || {});
          Object.keys(responseData.errors || {}).forEach((key) => {
            responseData.errors?.[key].forEach((errorMsg: string) => {
              toast.error(errorMsg);
            });
          });
        } else if (response.status === 401) {
          localStorage.removeItem("auth_token");
          toast.error("Session expired. Please login again");
          navigate("/login");
        } else {
          throw new Error(responseData.message || "Form submission failed");
        }
        return;
      }

      if (responseData.status === "error") {
        throw new Error(responseData.message || "Failed to fetch form details");
      }

      setSelectedForm(responseData.data[0]);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching form details:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load form details"
      );
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // const token = localStorage.getItem("auth_token");

  const confirmAndDeleteItem = (item: number, title: string) => {
    setSelectedDeleteRep({ id: item, name: title });
    setShowDeleteModal(true);
  };

  const handleDownloadDocs = async (id: number) => {
    setDownloadingId(id); // start loader
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/file/download-zip/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Try to extract error message from JSON if possible
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to download documents" }));
        throw new Error(errorData.error || "Failed to download documents");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `documents-${id}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading documents:", error);
      toast.error("Failed to download documents");
    } finally {
      setDownloadingId(null); // stop loader
    }
  };

  const handleDownloadDesignPDF = async (form: FormData) => {
    // Also trigger zip download
    handleDownloadDocs(form.id);
    setDownloadingPDFId(form.id);
    try {
      const containerId = `pdf-design-container-${form.id}`;
      const container = document.getElementById(containerId);

      if (!container) return;

      container.innerHTML = "";
      ReactDOM.render(<PreAppDetailsPDF form={form} />, container);

      // Wait for all images to load before rendering
      const images = container.getElementsByTagName("img");
      await Promise.all(
        Array.from(images).map(img => {
          // Ensure image URL is absolute
          if (img.src.startsWith('/')) {
            img.src = `${import.meta.env.VITE_IMAGE_URL}${img.src}`;
          }
          return img.complete
            ? Promise.resolve()
            : new Promise(resolve => {
                img.onload = img.onerror = resolve;
              });
        })
      );

      // Additional wait to ensure all content is rendered
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        logging: true,
        onclone: (clonedDoc) => {
          // Ensure all images in the cloned document have absolute URLs
          const clonedImages = clonedDoc.getElementsByTagName('img');
          Array.from(clonedImages).forEach(img => {
            if (img.src.startsWith('/')) {
              img.src = `${import.meta.env.VITE_IMAGE_URL}${img.src}`;
            }
          });
        }
      });

      const imgHeight = canvas.height;
      const imgWidth = canvas.width;

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "px", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      const ratio = (pageWidth - 2 * margin) / imgWidth;
      const scaledHeight = imgHeight * ratio;

      let position = 0;

      while (position < scaledHeight) {
        const pageCanvas = document.createElement("canvas");
        const pageCtx = pageCanvas.getContext("2d")!;
        const sliceHeight = Math.min(imgHeight, (pageHeight - 2 * margin) / ratio);
        pageCanvas.width = imgWidth;
        pageCanvas.height = sliceHeight;

        // Copy portion of full canvas into page canvas
        pageCtx.drawImage(canvas, 0, position / ratio, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);

        const pageData = pageCanvas.toDataURL("image/png");
        if (position > 0) pdf.addPage();
        pdf.addImage(pageData, "PNG", margin, margin, pageWidth - 2 * margin, sliceHeight * ratio);
        position += sliceHeight * ratio;
      }

      pdf.save(`pre-application-design-${form.id}.pdf`);
    } finally {
      setDownloadingPDFId(null);
    }
  };

  // Email Modal form handlers
  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailForm({ ...emailForm, [e.target.name]: e.target.value });
  };
  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSending(true);
    const payload = {
      dba: emailForm.dba,
      merchant_name: emailForm.merchantName,
      email: emailForm.email,
      phone: emailForm.phone,
      iso_form_link: preAppLink,
      user_id: user_id,
    };
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/send-form-link-mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok && result.status === "success") {
        toast.success("Email sent successfully");
        setShowEmailModal(false);
        setEmailForm({ dba: "", merchantName: "", email: "", phone: "" });
        fetchForms();
      } else {
        toast.error(result.message || "Failed to send email");
      }
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8 bg-tracer-green rounded-lg p-6 shadow-lg">
        <div className="flex items-center space-x-3">
          <FormInput className="h-10 w-10 text-white" />
          <div>
            <h1 className="text-3xl font-bold text-white">Pre-Applications</h1>
            <p className="text-white/80 mt-1">
              Manage and track merchant pre-applications.
            </p>
          </div>
        </div>
      </div>

      {/* Pre-Application Link Section */}
      <div className="bg-zinc-900 rounded-lg shadow-sm p-6 mb-8 border border-tracer-blue/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Pre-Application Form Link
          </h2>
          <button
            onClick={() => setShowEmailModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-tracer-green hover:bg-tracer-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tracer-green"
          >
            <Mail className="h-5 w-5 mr-2" />
            Email
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={preAppLink}
              className="block pr-10 truncate bg-zinc-800 border-zinc-700 text-white rounded-md focus:ring-tracer-green focus:border-tracer-green mr-2"
              style={{ width: 'calc(100% - 129px)' }}
            />
            <div className="absolute inset-y-0 right-24 flex items-center pr-9">
              <a
                href={preAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-tracer-green"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
            <button
              onClick={copyLink}
              className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-tracer-green hover:bg-tracer-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tracer-green"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-tracer-green"
                onClick={() => setShowEmailModal(false)}
              >
                <X className="h-6 w-6" />
              </button>
              <h3 className="text-lg font-semibold text-tracer-green mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2" /> Send Pre-Application Link via Email
              </h3>
              <form onSubmit={handleEmailFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">DBA</label>
                  <input
                    type="text"
                    name="dba"
                    value={emailForm.dba}
                    onChange={handleEmailInputChange}
                    className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Merchant Name</label>
                  <input
                    type="text"
                    name="merchantName"
                    value={emailForm.merchantName}
                    onChange={handleEmailInputChange}
                    className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={emailForm.email}
                    onChange={handleEmailInputChange}
                    className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={emailForm.phone}
                    onChange={handleEmailInputChange}
                    className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-tracer-green hover:bg-tracer-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tracer-green"
                  disabled={emailSending}
                >
                  {emailSending ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : null}
                  Send to Email
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Pre-Application List */}
      <div className="bg-zinc-900 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Pre-Application List
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-tracer-green" />
          </div>
        ) : forms.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No pre-applications found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    DBA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Business Contact Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                  
                </tr>
              </thead>
              <tbody className="bg-zinc-900 divide-y divide-gray-700">
                {forms.map((form) => (
                  <tr key={form.id} className="hover:bg-zinc-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {form.business_dba || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {form.business_contact_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {form.get_jotform_details?.[0]?.business_contact_mail || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {/* {form.phone || "-"} */}
                     {form.get_jotform_details?.[0]?.business_location_phone_number || "-"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[12px] font-medium rounded-full 
                        ${form.iso_form_status === 0 ? 'bg-tracer-green/10 text-tracer-green' :
                          form.iso_form_status === 1 ? 'bg-blue-100 text-blue-800' :
                          form.iso_form_status === 2 ? 'bg-green-100 text-green-800' :
                          form.iso_form_status === 3 ? 'bg-red-100 text-red-800' :
                          form.iso_form_status === 4 ? 'bg-purple-100 text-purple-800' :
                          form.iso_form_status === 5 ? 'bg-teal-100 text-teal-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        
                        {form.iso_form_status === 0 ? 'Pending' :
                          form.iso_form_status === 1 ? 'Sent' :
                          form.iso_form_status === 2 ? 'Delivered' :
                          form.iso_form_status === 3 ? 'Opened' :
                          form.iso_form_status === 4 ? 'Link Clicked' :
                          form.iso_form_status === 5 ? 'Completed' :
                          'Unknown'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => {
                            setSelectedForm(form);
                            setShowDetailsModal(true);
                          }}
                          className="text-tracer-green hover:text-tracer-blue flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          {/* View */}
                        </button>
                        {/* <button
                          onClick={() => {
                            setSelectedForm(form);
                            setShowDuplicateModal(true);
                          }}
                          className="text-tracer-green hover:text-tracer-blue flex items-center gap-1"
                        >
                          <Duplicate className="h-4 w-4" />
                          Replicate
                        </button> */}

                        <button
                          onClick={() =>
                            confirmAndDeleteItem(form.id, form.dba)
                          }
                          className="text-tracer-green hover:text-tracer-blue flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          {/* Delete */}
                        </button>

                        {/* {form.mail_status === 2 && ( */}
                          {/* <button
                            onClick={() => handleDownloadDocs(form.id)}
                            disabled={downloadingId === form.id}
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              downloadingId === form.id
                                ? "bg-tracer-green/20 text-tracer-green"
                                : "bg-tracer-green/10 text-tracer-green hover:bg-tracer-green/20"
                            } px-2 py-0.5 rounded-full`}
                            title="Download uploaded documents"
                          >
                            {downloadingId === form.id ? (
                              <>
                                <svg
                                  className="animate-spin h-4 w-4 text-tracer-green"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                  ></path>
                                </svg>
                                Loading...
                              </>
                            ) : (
                              <>
                                <Download className="h-3.5 w-3.5" />
                                Download
                              </>
                            )}
                          </button> */}
                        {/* )} */}
                        {/* <button
                          onClick={() => handleDownloadPDF(form)}
                          className="text-tracer-green hover:text-tracer-blue flex items-center gap-1"
                          title="Download Details as PDF"
                        >
                          <FileText className="h-4 w-4" />
                          PDF
                        </button> */}
                        <button
                          onClick={() => handleDownloadDesignPDF(form)}
                          className="text-tracer-green hover:text-tracer-blue flex items-center gap-1"
                          title="Download Design PDF"
                          disabled={downloadingPDFId === form.id}
                        >
                          {downloadingPDFId === form.id ? (
                            <svg className="animate-spin h-4 w-4 text-tracer-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          PDF
                        </button>
                        {/* ...existing buttons... */}
                        {/* Hidden container for PDF rendering */}
                        <div id={`pdf-design-container-${form.id}`} style={{ position: "fixed", left: "-9999px", top: 0 }}>
                          <PreAppDetailsPDF form={form} />
                        </div>
                      </div>
                    </td>

                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center space-x-4">

                        {form.mail_status === 1 && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-tracer-green/10 px-2 py-0.5 rounded-full">
                            <i className="fas fa-paper-plane text-white-500 text-sm"></i>
                            Sent
                          </span>
                        )}


                        {form.mail_status === 2 && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                            Uploaded
                          </span>
                        )}


                        {form.mail_status === 2 && (
                          <div className="text-xs text-center leading-tight">
                            <div className="text-white-500 font-medium">
                              <span className="block">Personal</span>
                              <span className="block">Guarantee</span>
                            </div>
                            <div
                              className={`mt-1 px-2 py-0.5 rounded-full inline-block font-semibold ${form.personal_guarantee_required === 'yes'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-600'
                                }`}
                            >
                              {form.personal_guarantee_required}
                            </div>
                          </div>
                        )}




                        {form.mail_status === 0 && (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                            title="No action taken yet"
                          >
                            <svg
                              className="h-2 w-2 animate-pulse text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                            Pending
                          </span>
                        )}


                      </div>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Details Modal */}
      {showDetailsModal && (
        <FormDetailsModal
          form={selectedForm}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedForm(null);
          }}
        />
      )}

      {/* Duplicate Form Modal */}
      {showDuplicateModal && (
        <DuplicateFormModal
          form={selectedForm}
          onClose={() => {
            setShowDuplicateModal(false);
            setSelectedForm(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDeleteRep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-md relative">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedDeleteRep(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Delete Pre-Application Form
              </h3>

              <p className="text-gray-300 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{selectedDeleteRep.name}</span>?
                This action cannot be undone.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedDeleteRep(null);
                  }}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      const accessToken = localStorage.getItem("auth_token");
                      const response = await fetch(
                        `${import.meta.env.VITE_API_BASE_URL}/destroy-jotform/${
                          selectedDeleteRep.id
                        }`,
                        {
                          method: "GET",
                          headers: {
                            Authorization: `Bearer ${accessToken}`,
                          },
                        }
                      );

                      const result = await response.json();

                      if (response.ok && result.status === "success") {
                        fetchForms();
                      } else {
                        alert("Failed to delete.");
                      }
                    } catch (err) {
                      alert("Delete failed.");
                    } finally {
                      setShowDeleteModal(false);
                      setSelectedDeleteRep(null);
                      setIsDeleting(false);
                    }
                  }}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition duration-200"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </div>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
