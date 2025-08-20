import {
  FileText,
  Folder,
  File,
  Loader2,
  LogOut,
  HardDrive,
  Cloud,
  Database,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../providers/AuthProvider";
import { useLocation } from "react-router-dom";

interface GoogleFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
}

interface DropboxFile {
  ".tag": string;
  name: string;
  path_lower: string;
  id: string;
  client_modified: string;
  server_modified: string;
  rev: string;
  size: number;
  is_downloadable: boolean;
  content_hash: string;
}

interface OneDriveFile {
  id: string;
  name: string;
  webUrl: string;
  size?: number;
  file?: {
    mimeType: string;
  };
  folder?: {
    childCount: number;
  };
}

type StorageService = "google" | "dropbox" | "onedrive";

// Google Drive SVG Logo
const GoogleDriveLogo = ({ size = 28 }: { size?: number }) => (

  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48px"
    height="22px"
  >
    <path
      fill="#1e88e5"
      d="M38.59,39c-0.535,0.93-0.298,1.68-1.195,2.197C36.498,41.715,35.465,42,34.39,42H13.61 c-1.074,0-2.106-0.285-3.004-0.802C9.708,40.681,9.945,39.93,9.41,39l7.67-9h13.84L38.59,39z"
    />
    <path
      fill="#fbc02d"
      d="M27.463,6.999c1.073-0.002,2.104-0.716,3.001-0.198c0.897,0.519,1.66,1.27,2.197,2.201l10.39,17.996 c0.537,0.93,0.807,1.967,0.808,3.002c0.001,1.037-1.267,2.073-1.806,3.001l-11.127-3.005l-6.924-11.993L27.463,6.999z"
    />
    <path
      fill="#e53935"
      d="M43.86,30c0,1.04-0.27,2.07-0.81,3l-3.67,6.35c-0.53,0.78-1.21,1.4-1.99,1.85L30.92,30H43.86z"
    />
    <path
      fill="#4caf50"
      d="M5.947,33.001c-0.538-0.928-1.806-1.964-1.806-3c0.001-1.036,0.27-2.073,0.808-3.004l10.39-17.996 c0.537-0.93,1.3-1.682,2.196-2.2c0.897-0.519,1.929,0.195,3.002,0.197l3.459,11.009l-6.922,11.989L5.947,33.001z"
    />
    <path
      fill="#1565c0"
      d="M17.08,30l-6.47,11.2c-0.78-0.45-1.46-1.07-1.99-1.85L4.95,33c-0.54-0.93-0.81-1.96-0.81-3H17.08z"
    />
    <path
      fill="#2e7d32"
      d="M30.46,6.8L24,18L17.53,6.8c0.78-0.45,1.66-0.73,2.6-0.79L27.46,6C28.54,6,29.57,6.28,30.46,6.8z"
    />
  </svg>
);

// Dropbox SVG Logo
const DropboxLogo = ({ size = 28 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48px"
    height="22px"
  >
    <path
      fill="#1E88E5"
      d="M42 13.976L31.377 7.255 24 13.314 35.026 19.732zM6 25.647L16.933 32.055 24 26.633 13.528 19.969zM16.933 7.255L6 14.301 13.528 19.969 24 13.314zM24 26.633L31.209 32.055 42 25.647 35.026 19.732z"
    />
    <path
      fill="#1E88E5"
      d="M32.195 33.779L31.047 34.462 29.979 33.658 24 29.162 18.155 33.646 17.091 34.464 15.933 33.785 13 32.066 13 34.738 23.988 42 35 34.794 35 32.114z"
    />
  </svg>
);

// OneDrive SVG Logo
const OneDriveLogo = ({ size = 28 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48px"
    height="22px"
  >
    <path
      fill="#1565c0"
      d="M40.429,35.999c0,0,2.89-0.393,3.47-3.185C43.964,32.502,44,32.161,44,31.787 c0-0.233-0.015-0.454-0.044-0.665c-0.428-3.158-3.852-3.868-3.852-3.868s0.595-3.401-2.543-5.183c-3.138-1.78-6.005,0-6.005,0 s-1.678-3.401-6.222-3.401c-5.843,0-6.817,6.64-6.817,6.64S13,25.636,13,30.493C13,35.352,18.031,36,18.031,36L40.429,35.999 L40.429,35.999z"
    />
    <path
      fill="#1565c0"
      d="M11,30.493c0-4.395,3.286-6.319,5.875-6.945c0.898-2.954,3.384-6.878,8.46-6.878 c0.006,0,0.011,0.001,0.017,0.001c0.007,0,0.013-0.001,0.02-0.001c3.522,0,5.71,1.646,6.892,2.953 c0.65-0.191,1.448-0.343,2.347-0.343c0.004,0,0.007,0.001,0.011,0.001c0.003,0,0.006,0,0.01,0c0.02,0,0.039,0.004,0.059,0.004 C34.729,19,34.063,12,26.013,12c-5.503,0-7.446,4.691-7.446,4.691s-3.992-2.965-8.092,1.133c-2.105,2.104-1.619,5.338-1.619,5.338 S4,23.648,4,28.825C4.001,33.515,9.018,34,9.018,34h2.807C11.32,33.041,11,31.886,11,30.493z"
    />
  </svg>
);

export default function DocumentCenter() {
  const { token } = useAuth();
  const [googleFiles, setGoogleFiles] = useState<GoogleFile[]>([]);
  const [dropboxFiles, setDropboxFiles] = useState<DropboxFile[]>([]);
  const [onedriveFiles, setOnedriveFiles] = useState<OneDriveFile[]>([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isDropboxConnected, setIsDropboxConnected] = useState(false);
  const [isOnedriveConnected, setIsOnedriveConnected] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDropboxLoading, setIsDropboxLoading] = useState(false);
  const [isOnedriveLoading, setIsOnedriveLoading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [activeTab, setActiveTab] = useState<StorageService>("google");
  const location = useLocation();

  useEffect(() => {
    checkGoogleDriveConnection();
    checkDropboxConnection();
    checkOnedriveConnection();

    // Check for OAuth callbacks
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const state = params.get("state");
    const scope = params.get("scope");

    console.log("OAuth callback detected:", {
      code,
      state,
      scope,
      location: location.search,
    });

    if (code && token) {
      if (state === "dropbox") {
        console.log("Handling Dropbox callback");
        handleDropboxCallback(code);
      } else if (state === "onedrive") {
        console.log("Handling OneDrive callback");
        handleOnedriveCallback(code);
      } else if (scope?.includes("googleapis.com")) {
        console.log("Handling Google callback");
        handleGoogleCallback(code);
      } else {
        console.error("Unknown callback type:", { state, scope });
        toast.error("Invalid callback type");
      }
    }
  }, [location, token]);

  const handleGoogleCallback = async (code: string) => {
    try {
      setIsGoogleLoading(true);
      console.log("Sending Google callback request to backend");
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/google/callback`,
        { code },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Google callback response:", response.data);

      if (response.data.status === "success") {
        toast.success("Successfully connected to Google Drive!");
        checkGoogleDriveConnection();
      }
    } catch (error: any) {
      console.error("Error handling Google callback:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        toast.error(
          error.response.data.message || "Failed to connect to Google Drive"
        );
      } else {
        toast.error("Failed to connect to Google Drive");
      }
    } finally {
      setIsGoogleLoading(false);
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleDropboxCallback = async (code: string) => {
    try {
      setIsDropboxLoading(true);
      console.log(
        "Sending Dropbox callback request to backend with code:",
        code
      );
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/dropbox/callback`,
        { code },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Dropbox callback response:", response.data);

      if (response.data.status === "success") {
        toast.success("Successfully connected to Dropbox!");
        checkDropboxConnection();
      } else {
        console.error("Dropbox callback failed:", response.data);
        toast.error(response.data.message || "Failed to connect to Dropbox");
      }
    } catch (error: any) {
      console.error("Error handling Dropbox callback:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        toast.error(
          error.response.data.message || "Failed to connect to Dropbox"
        );
      } else {
        toast.error("Failed to connect to Dropbox");
      }
    } finally {
      setIsDropboxLoading(false);
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleOnedriveCallback = async (code: string) => {
    try {
      setIsOnedriveLoading(true);
      console.log(
        "Sending OneDrive callback request to backend with code:",
        code
      );
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/onedrive/callback`,
        { code },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("OneDrive callback response:", response.data);

      if (response.data.status === "success") {
        toast.success("Successfully connected to OneDrive!");
        checkOnedriveConnection();
      } else {
        console.error("OneDrive callback failed:", response.data);
        toast.error(response.data.message || "Failed to connect to OneDrive");
      }
    } catch (error: any) {
      console.error("Error handling OneDrive callback:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        toast.error(
          error.response.data.message || "Failed to connect to OneDrive"
        );
      } else {
        toast.error("Failed to connect to OneDrive");
      }
    } finally {
      setIsOnedriveLoading(false);
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const checkGoogleDriveConnection = async () => {
    try {
      setIsLoadingFiles(true);

      if (!token) {
        console.error("No authentication token found");
        toast.error("Please log in to access Google Drive");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/google/drive/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data.status === "success" && response.data.files) {
        setIsGoogleConnected(true);
        setGoogleFiles(response.data.files);
      }
    } catch (error: any) {
      console.error("Error checking Google Drive connection:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);

        if (error.response.status === 401) {
          toast.error("Authentication failed. Please try logging in again.");
        } else {
          toast.error(
            error.response.data.message || "Failed to connect to Google Drive"
          );
        }
      }
      setIsGoogleConnected(false);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const checkDropboxConnection = async () => {
    try {
      setIsLoadingFiles(true);

      if (!token) {
        console.error("No authentication token found");
        toast.error("Please log in to access Dropbox");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/dropbox/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data.status === "success" && response.data.files) {
        setIsDropboxConnected(true);
        setDropboxFiles(response.data.files);
      }
    } catch (error: any) {
      console.error("Error checking Dropbox connection:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);

        if (error.response.status === 401) {
          toast.error("Authentication failed. Please try logging in again.");
        } else {
          toast.error(
            error.response.data.message || "Failed to connect to Dropbox"
          );
        }
      }
      setIsDropboxConnected(false);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const checkOnedriveConnection = async () => {
    try {
      setIsLoadingFiles(true);

      if (!token) {
        console.error("No authentication token found");
        toast.error("Please log in to access OneDrive");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/onedrive/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data.status === "success" && response.data.files) {
        setIsOnedriveConnected(true);
        setOnedriveFiles(response.data.files);
      }
    } catch (error: any) {
      console.error("Error checking OneDrive connection:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);

        if (error.response.status === 401) {
          toast.error("Authentication failed. Please try logging in again.");
        } else {
          toast.error(
            error.response.data.message || "Failed to connect to OneDrive"
          );
        }
      }
      setIsOnedriveConnected(false);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleConnectGoogleDrive = async () => {
    try {
      setIsGoogleLoading(true);
      if (!token) {
        toast.error("Please log in to connect Google Drive");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/google/redirect`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.redirect_url) {
        window.location.href = response.data.redirect_url;
      }
    } catch (error: any) {
      console.error("Error connecting to Google Drive:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        toast.error(
          error.response.data.message || "Failed to connect to Google Drive"
        );
      } else {
        toast.error("Failed to connect to Google Drive");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleConnectDropbox = async () => {
    try {
      setIsDropboxLoading(true);
      if (!token) {
        toast.error("Please log in to connect Dropbox");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/dropbox/redirect`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.redirect_url) {
        window.location.href = response.data.redirect_url;
      }
    } catch (error: any) {
      console.error("Error connecting to Dropbox:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        toast.error(
          error.response.data.message || "Failed to connect to Dropbox"
        );
      } else {
        toast.error("Failed to connect to Dropbox");
      }
    } finally {
      setIsDropboxLoading(false);
    }
  };

  const handleConnectOnedrive = async () => {
    try {
      setIsOnedriveLoading(true);
      if (!token) {
        toast.error("Please log in to connect OneDrive");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/onedrive/redirect`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.redirect_url) {
        window.location.href = response.data.redirect_url;
      }
    } catch (error: any) {
      console.error("Error connecting to OneDrive:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        toast.error(
          error.response.data.message || "Failed to connect to OneDrive"
        );
      } else {
        toast.error("Failed to connect to OneDrive");
      }
    } finally {
      setIsOnedriveLoading(false);
    }
  };

  const handleDisconnect = async (service: StorageService) => {
    try {
      if (service === "google") {
        setIsGoogleLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/google/disconnect`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.status === "success") {
          setIsGoogleConnected(false);
          setGoogleFiles([]);
          toast.success("Successfully disconnected from Google Drive");
        }
      } else if (service === "dropbox") {
        setIsDropboxLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/dropbox/disconnect`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.status === "success") {
          setIsDropboxConnected(false);
          setDropboxFiles([]);
          toast.success("Successfully disconnected from Dropbox");
        }
      } else if (service === "onedrive") {
        setIsOnedriveLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/onedrive/disconnect`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.status === "success") {
          setIsOnedriveConnected(false);
          setOnedriveFiles([]);
          toast.success("Successfully disconnected from OneDrive");
        }
      }
    } catch (error: any) {
      console.error(`Error disconnecting from ${service}:`, error);
      if (error.response) {
        toast.error(
          error.response.data.message || `Failed to disconnect from ${service}`
        );
      } else {
        toast.error(`Failed to disconnect from ${service}`);
      }
    } finally {
      if (service === "google") {
        setIsGoogleLoading(false);
      } else if (service === "dropbox") {
        setIsDropboxLoading(false);
      } else if (service === "onedrive") {
        setIsOnedriveLoading(false);
      }
    }
  };

  const renderStorageContent = () => {
    if (isLoadingFiles) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
        </div>
      );
    }

    if (activeTab === "google") {
      if (!isGoogleConnected) {
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Connect to Google Drive to view your files
            </p>
            <button
            onClick={handleConnectGoogleDrive}
            disabled={isGoogleLoading}
            className={`bg-white rounded py-3 px-5 font-semibold uppercase flex items-center justify-center hover:bg-gray-200 gap-3 text-black mx-auto ${
              isGoogleLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <GoogleDriveLogo size={28} />
            {isGoogleLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            <span className="tracking-wide">Connect Google Drive</span>
          </button>

          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Google Drive Files</h2>
            <button
              onClick={() => handleDisconnect("google")}
              disabled={isGoogleLoading}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <LogOut className="h-5 w-5" />
              Disconnect
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {googleFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 border rounded-lg hover:border-yellow-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {file.mimeType.includes("folder") ? (
                    <Folder className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <File className="h-6 w-6 text-yellow-400" />
                  )}
                  <div>
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:text-yellow-600"
                    >
                      {file.name}
                    </a>
                    <p className="text-xs text-gray-500">
                      {file.mimeType.split("/").pop()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "dropbox") {
      if (!isDropboxConnected) {
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Connect to Dropbox to view your files
            </p>
            <button
              onClick={handleConnectDropbox}
              disabled={isDropboxLoading}
              className={`bg-white rounded py-3 px-5 font-semibold uppercase flex items-center justify-center hover:bg-gray-200 gap-3 text-black mx-auto ${
                isDropboxLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <DropboxLogo size={28} />
              {isDropboxLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              <span className="tracking-wide">Connect Dropbox</span>
            </button>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Dropbox Files</h2>
            <button
              onClick={() => handleDisconnect("dropbox")}
              disabled={isDropboxLoading}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <LogOut className="h-5 w-5" />
              Disconnect
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dropboxFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 border rounded-lg hover:border-yellow-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {file[".tag"] === "folder" ? (
                    <Folder className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <File className="h-6 w-6 text-yellow-400" />
                  )}
                  <div>
                    <a
                      href={`https://www.dropbox.com/home${file.path_lower}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:text-yellow-600"
                    >
                      {file.name}
                    </a>
                    <p className="text-xs text-gray-500">
                      {file[".tag"] === "file" ? "File" : "Folder"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "onedrive") {
      if (!isOnedriveConnected) {
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Connect to OneDrive to view your files
            </p>
            <button
              onClick={handleConnectOnedrive}
              disabled={isOnedriveLoading}
              className={`bg-white rounded py-3 px-5 font-semibold uppercase flex items-center justify-center hover:bg-gray-200 gap-3 text-black mx-auto ${
                isOnedriveLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <OneDriveLogo size={28} />
              {isOnedriveLoading && (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
              <span className="tracking-wide">Connect OneDrive</span>
            </button>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your OneDrive Files</h2>
            <button
              onClick={() => handleDisconnect("onedrive")}
              disabled={isOnedriveLoading}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <LogOut className="h-5 w-5" />
              Disconnect
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onedriveFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 border rounded-lg hover:border-yellow-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {file.folder ? (
                    <Folder className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <File className="h-6 w-6 text-yellow-400" />
                  )}
                  <div>
                    <a
                      href={file.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:text-yellow-600"
                    >
                      {file.name}
                    </a>
                    <p className="text-xs text-gray-500">
                      {file.folder
                        ? "Folder"
                        : file.file?.mimeType.split("/").pop() || "File"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 bg-tracer-green rounded-lg p-6 shadow-lg">
        <div className="flex items-center space-x-3">
          <FileText className="h-10 w-10 text-white" />
          <div>
            <h1 className="text-3xl font-bold text-white">Document Center</h1>
            <p className="text-white/80 mt-1">
              Access and manage your files from various cloud storage services.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("google")}
            className={`${
              activeTab === "google"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200`}
          >
            <GoogleDriveLogo size={24} />
            Google Drive
          </button>

          <button
            onClick={() => setActiveTab("dropbox")}
            className={`${
              activeTab === "dropbox"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200`}
          >
            <DropboxLogo size={24} />
            Dropbox
          </button>
          <button
            onClick={() => setActiveTab("onedrive")}
            className={`${
              activeTab === "onedrive"
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200`}
          >
            <OneDriveLogo size={24} />
            OneDrive
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {renderStorageContent()}
      </div>
    </div>
  );
}
