import React, { useState, useEffect } from "react";
import { Download, Trash, Mail } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface FileData {
  id: number;
  user_id: number;
  file_path: string;
  file_original_name: string;
  prospect_name: string | null;
  email: string | null;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: FileData[];
}

interface EmailFormData {
  email: string;
  name: string;
  // formId: string;
}

const imageTypes = ["jpg", "jpeg", "png", "gif"];

const SecurePortal: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileData | null>(null);
  const [formData, setFormData] = useState<EmailFormData>({
    email: "",
    name: "",
    // formId: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);
  const [forms, setForms] = useState<any[]>([]);

  useEffect(() => {
    fetchFiles();
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token");
      const value = localStorage.getItem("auth_user");
      const parsedUser = value ? JSON.parse(value) : null;

      let body = undefined;

      // Add user_id to body only if role is NOT 1 or 2
      if (parsedUser && parsedUser.role_id !== 1 && parsedUser.role_id !== 2) {
        body = JSON.stringify({ user_id: parsedUser.id });
      }

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
      console.log('Forms Response:', responseData);

      if (!response.ok) {
        throw new Error("Failed to fetch files");
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

  const fetchFiles = async () => {
    try {
      setIsLoadingFiles(true);
      const token = localStorage.getItem("auth_token");
      const userData = localStorage.getItem("auth_user");

      if (!userData) {
        throw new Error("User data not found");
      }

      const user = JSON.parse(userData);
      const userId = user.id;

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/file/user-lists/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const data: ApiResponse = await response.json();
      console.log(data);
      setFiles(data.data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to fetch files");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('auth_user');

      if (!userData) {
        throw new Error('User data not found');
      }

      const user = JSON.parse(userData);
      const userId = user.id;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/send-mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          user_id: userId.toString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const data = await response.json();
      console.log('Email sent successfully:', data);
      toast.success(data.message || 'Secure upload link has been sent successfully!');
      setIsModalOpen(false);
      setFormData({ email: '', name: '' });
      fetchFiles(); // Refresh the file list after sending email
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (file: FileData) => {
    setFileToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/file/delete/${fileToDelete.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      const data = await response.json();
      toast.success(data.message || "File deleted successfully");
      fetchFiles(); // Refresh the file list
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (file: FileData) => {
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

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  const calculateRemainingDays = (uploadedAt: string): number => {
    const uploadDate = new Date(uploadedAt);
    const expiryDate = new Date(uploadDate);
    expiryDate.setDate(uploadDate.getDate() + 180); // Add 180 days

    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 ml-2">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Secure File Upload Portal
              </h1>
              <p className="text-gray-600">
                Manage and share secure file upload links with your clients
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-tracer-green hover:bg-tracer-blue text-white py-2 px-4 rounded flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Upload Link
            </button>
          </div>

          <div className="added-wrap mt-10 text-gray-800">
            {isLoadingFiles ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-tracer-green border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No files uploaded yet
              </div>
            ) : (
              <div>
                {files.map((file) => {
                  const remainingDays = calculateRemainingDays(
                    file.uploaded_at
                  );
                  const ext =
                    file.file_path.split(".").pop()?.toLowerCase() || "";
                  const isImage = imageTypes.includes(ext);
                  const fileUrl = `${import.meta.env.VITE_IMAGE_URL}${
                    file.file_path
                  }`;

                  console.log(fileUrl);

                  return (
                    <div
                      key={file.id}
                      className="group mt-5 w-full px-5 py-3 rounded bg-white border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green relative hover:bg-gray-50"
                      onMouseEnter={() => setHoveredFileId(file.id)}
                      onMouseLeave={() => setHoveredFileId(null)}
                    >
                      <div className="flex flex-col">
                        <p className="uploaded-file-name">
                          <span
                            className="cursor-pointer hover:text-tracer-blue"
                            onClick={() =>
                              window.open(
                                `${import.meta.env.VITE_IMAGE_URL}${
                                  file.file_path
                                }`,
                                "_blank"
                              )
                            }
                          >
                            {file.file_original_name}
                          </span>
                          <span className="total-v pl-5">
                            (Expires in {remainingDays} days)
                          </span>
                        </p>
                        {(file.prospect_name || file.email) && (
                          <p className="text-sm text-gray-600 mt-1">
                            {file.prospect_name &&
                              `Sender: ${file.prospect_name}`}
                            {file.prospect_name && file.email && " • "}
                            {file.email && `Email: ${file.email}`}
                          </p>
                        )}
                      </div>

                      {/* Preview Popup */}
                      {hoveredFileId === file.id && (
                        <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-tracer-green/40 rounded shadow-lg p-2 min-w-[120px] max-w-[220px] flex flex-col items-center">
                          {isImage ? (
                            <img
                              src={fileUrl}
                              alt={file.file_original_name}
                              className="max-w-[200px] max-h-[160px] rounded shadow border border-gray-200"
                              style={{ objectFit: "contain" }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4">
                              <Download className="w-10 h-10 text-tracer-green mb-2" />
                              <span className="text-xs text-gray-600">
                                Preview not available
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="addedDetail absolute right-[20px] top-[50%] translate-y-[-50%] hidden group-hover:block">
                        <ul className="flex gap-4 align-center">
                          <li
                            className="cursor-pointer hover:text-tracer-blue"
                            onClick={() => handleDownload(file)}
                          >
                            {isDownloading ? (
                              <div className="w-5 h-5 border-2 border-tracer-green border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Download />
                            )}
                          </li>
                          <li
                            className="cursor-pointer hover:text-red-600"
                            onClick={() => handleDeleteClick(file)}
                          >
                            <Trash />
                          </li>
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md relative shadow-xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Send Secure Upload Link
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Client Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Client Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                  required
                />
              </div>

              {/* <div>
                <label className="block text-gray-300 mb-2">Select Form</label>
                <select
                  name="formId"
                  value={formData.formId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                  required
                >
                  <option value="">Select From Pre-Application List</option>
                  {forms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.business_dba}
                    </option>
                  ))}
                </select>
              </div> */}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-tracer-green hover:bg-tracer-blue text-white py-3 px-5 rounded font-medium uppercase transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Link
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && fileToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md relative shadow-xl">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setFileToDelete(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash className="h-6 w-6 text-red-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete File</h3>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this file?
              </p>
              <p className="text-tracer-green font-medium">
                {fileToDelete.file_path.split("/").pop()}
              </p>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setFileToDelete(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-5 rounded font-medium uppercase transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-5 rounded font-medium uppercase transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
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
    <Toaster position="top-right" />
    </>
  );
};

export default SecurePortal;
