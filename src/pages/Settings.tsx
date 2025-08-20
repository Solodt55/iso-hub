import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

export default function Settings() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);

    const parsedUser = JSON.parse(localStorage.getItem("auth_user") || "{}");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/update-user-info`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            user_id: parsedUser.id,
            ...(password ? { new_password: password } : {}),
          }),
        }
      );

      const responseData = await res.json();

      if (!res.ok) {
        if (responseData.errors) {
          // Extract and display Laravel validation errors
          const allErrors = Object.values(responseData.errors).flat().join(" ");
          throw new Error(allErrors);
        } else {
          throw new Error(responseData.message || "Failed to update profile");
        }
      }
      setSuccess("Profile updated successfully!");
      toast.success('Profile updated successfully!');
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  const getUserDetails = async () => {
    try {
      const parsedUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
      const accessToken = localStorage.getItem("auth_token");
      if (!accessToken) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/get-user-details`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: parsedUser.id }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch user details");

      const data = await response.json();

      console.log(data, "data");

      setFirstName(data.data.first_name || "");
      setLastName(data.data.last_name || "");
      setEmail(data.data.email || "");
      setPhone(data.data.phone || "");
    } catch (error) {
      console.error("Failed to fetch user details", error);
      toast.error("Failed to load user details");
    }
  };

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-xl mx-auto mt-2 bg-zinc-800 rounded-xl p-8 border border-yellow-400/20 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">User Setting</h2>
        <form onSubmit={handleSave} className="space-y-6">
          {/* First and Last Name */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-gray-300 mb-2">First Name</label>
              <input
                type="text"
                placeholder="Enter first name"
                className="w-full px-4 py-2 rounded-lg bg-zinc-900 text-white border border-yellow-400/20 focus:border-yellow-400 focus:outline-none"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-300 mb-2">Last Name</label>
              <input
                type="text"
                placeholder="Enter last name"
                className="w-full px-4 py-2 rounded-lg bg-zinc-900 text-white border border-yellow-400/20 focus:border-yellow-400 focus:outline-none"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email and Phone */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="text"
                placeholder="Enter email address"
                className="w-full px-4 py-2 rounded-lg bg-zinc-900 text-white border border-yellow-400/20 focus:border-yellow-400 focus:outline-none"
                value={email || ""}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-300 mb-2">Phone Number</label>
              <input
                type="text"
                placeholder="Enter phone number"
                className="w-full px-4 py-2 rounded-lg bg-zinc-900 text-white border border-yellow-400/20 focus:border-yellow-400 focus:outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Passwords with Toggle Icons */}
          <div className="flex gap-4">
            <div className="w-1/2 relative">
              <label className="block text-gray-300 mb-2">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 pr-10 rounded-lg bg-zinc-900 text-white border border-yellow-400/20 focus:border-yellow-400 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
              />
              <span
                className="absolute right-3 top-10 cursor-pointer text-tracer-green"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            <div className="w-1/2 relative">
              <label className="block text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full px-4 py-2 pr-10 rounded-lg bg-zinc-900 text-white border border-yellow-400/20 focus:border-yellow-400 focus:outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
              <span
                className="absolute right-3 top-10 cursor-pointer text-tracer-green"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {/* Feedback Messages */}
          {success && (
            <div className="text-green-400 font-medium">{success}</div>
          )}
          {error && <div className="text-red-400 font-medium">{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-tracer-blue text-white font-bold rounded-lg hover:bg-tracer-blue/90 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
