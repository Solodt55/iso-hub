import { useState, useEffect } from "react";
import { Edit, Trash, X, Loader2, Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role_id: number;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  birthday?: Date | string;
}

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  role_id: string;
  birthday: string; // Form input uses string, we'll convert to Date when needed
}

interface ApiResponse {
  status: string;
  message: string;
  data: User[];
}

export default function Admin() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role_id: "5", // Default to user role
    birthday: "",
  });

  // Filter states
  const [managersChecked, setManagersChecked] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [teamLeadersChecked, setTeamLeadersChecked] = useState(false);
  const [teamMembersChecked, setTeamMembersChecked] = useState(false);
  const [usersChecked, setUsersChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  const authUser = localStorage.getItem("auth_user");
  const parsedUser = authUser ? JSON.parse(authUser) : null;
  const role_id = parsedUser.role_id;
  const user_id = parsedUser.id;

  const ROLE_MAPPING = {
    "3": "Manager",
    "4": "Team Leader",
    "5": "User",
    "2": "Admin",
    "1": "Super Admin",
    "6": "Team Member",
  };



  const fetchUsers = async (id?: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/lists`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: id ? JSON.stringify({ user_id: user_id }) : undefined,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data: ApiResponse = await response.json();
      setUsers(data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
    setIsSubmitting(true);
    setErrors({});

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const cleanToken = token.replace(/^Bearer\s+/i, "");
      const formattedToken = `Bearer ${cleanToken}`;

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/create`,
        {
          method: "POST",
          headers: {
            Authorization: formattedToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      let data: any = {};
      try {
        const responseText = await response.text();
        const contentType = response.headers.get("Content-Type") || "";

        if (contentType.includes("application/json")) {
          data = JSON.parse(responseText);
        } else {
          throw new Error("Invalid response format from server.");
        }
      } catch (err) {
        console.error("Failed to parse response:", err);
        toast.error("Server returned an unexpected response.");
        setIsSubmitting(false);
        return;
      }

      // ✅ Handle Laravel-style validation error (status 200 but body contains error)
      if (
        data.message === "Validation failed" &&
        typeof data.errors === "object"
      ) {
        const validationErrors = data.errors;
        setErrors(validationErrors);

        Object.values(validationErrors).forEach((fieldErrors: any) => {
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((msg: string) => toast.error(msg));
          }
        });

        setIsSubmitting(false);
        return;
      }

      // Handle unauthorized
      if (response.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      // Handle CORS or access issues
      if (response.status === 0 || response.status === 403) {
        toast.error(
          "Access denied. This may be due to CORS configuration. Please contact your administrator."
        );
        setIsSubmitting(false);
        return;
      }

      // Handle generic failure
      if (!response.ok && data.message) {
        throw new Error(data.message || "Failed to create user.");
      }

      // ✅ Handle success
      if (data.status === "success") {
        try {
          const emailResponse = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/send-credentials-mail`,
            {
              method: "POST",
              headers: {
                Authorization: formattedToken,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: `${formData.first_name} ${formData.last_name}`,
                email: formData.email,
                password: formData.password,
                user_id: data.data.id,
                website_name: "ISO Hub",
                website_url: `${import.meta.env.VITE_API_URL}/login`,
              }),
            }
          );

          const emailData = await emailResponse.json();
          if (!emailResponse.ok) {
            toast.error("User created but failed to send credentials email.");
          } else {
            toast.success("User created and credentials sent successfully.");
          }
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          toast.error("User created but failed to send credentials email.");
        }
        
        // ✅ Reset form after success
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          password: "",
          role_id: "5",
          birthday: "",
        });
        setIsModalOpen(false);
        await fetchUsers(); // Refresh users list
      } else {
        throw new Error(data.message || "Form submission failed.");
      }
    } catch (error) {
      console.error("Error creating user:", error);

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        toast.error(
          "Network error: Unable to connect to server. This may be due to CORS configuration."
        );
      } else {
        toast.error(error instanceof Error ? error.message : "Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/destroy/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Close the delete modal
      setDeleteModalOpen(false);
      setSelectedUser(null);

      // Refresh the users list after successful deletion
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    
    // Convert birthday to string format for form input
    let birthdayString = "";
    if (user.birthday) {
      if (typeof user.birthday === 'string') {
        birthdayString = user.birthday;
      } else if (user.birthday instanceof Date) {
        birthdayString = user.birthday.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }
    }
    
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      password: "", // Password field is empty for security
      role_id: user.role_id.toString(),
      birthday: birthdayString,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsUpdating(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            id: selectedUser.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Reset form and close modal
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        role_id: "5",
        birthday: "",
      });
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      setSelectedUser(null);
      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter handlers
  const handleManagersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManagersChecked(e.target.checked);
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminChecked(e.target.checked);
  };

  const handleTeamLeadersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamLeadersChecked(e.target.checked);
  };

  const handleUsersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsersChecked(e.target.checked);
  };

  const handleTeamMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamMembersChecked(e.target.checked);
  };

  // Filter the users array based on checked roles and exclude role_id 1 and 2
  const filteredUsers = users.filter((user) => {
    // Then apply checkbox filters
    if (
      !managersChecked &&
      !teamLeadersChecked &&
      !usersChecked &&
      !adminChecked &&
      !teamMembersChecked
    )
      return true;
    if (managersChecked && user.role_id === 3) return true;
    if (teamLeadersChecked && user.role_id === 4) return true;
    if (usersChecked && user.role_id === 5) return true;
    if (teamMembersChecked && user.role_id === 6) return true;
    if (adminChecked && (user.role_id === 1 || user.role_id === 2)) return true;
    return false;
  });

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="shortmembers my-10 flex gap-7 items-center w-full text-center bg-tracer-blue py-5 px-5 rounded">

        {/* {(parsedUser.role_id === 1) && ( this line is for only superadmin need to chnage*/}
        {/* {(parsedUser.role_id === 1) && (parsedUser.role_id === 2) && (
          <div className="short text-white font-medium flex items-center gap-2">
            <input
              type="checkbox"
              className="h-[20px] w-[20px]"
              onChange={handleAdminChange}
              checked={adminChecked}
            />
            <span>Admin</span>
          </div>
        )}

        {(parsedUser.role_id === 1) && (parsedUser.role_id === 2) && (
           <div className="short text-white font-medium flex items-center gap-2">
            <input
              type="checkbox"
              className="h-[20px] w-[20px]"
              onChange={handleManagersChange}
              checked={managersChecked}
            />
            <span>Managers</span>
           </div>
        )}

        {(parsedUser.role_id === 1) && (parsedUser.role_id === 2) && (parsedUser.role_id === 3) && (
          <div className="short text-white font-medium flex items-center gap-2">
            <input
              type="checkbox"
              className="h-[20px] w-[20px]"
              onChange={handleTeamLeadersChange}
              checked={teamLeadersChecked}
            />
          <span>Team Leaders</span>
        </div>
        )}

        <div className="short text-white font-medium flex items-center gap-2">
          <input
            type="checkbox"
            className="h-[20px] w-[20px]"
            onChange={handleUsersChange}
            checked={usersChecked}
          />
          <span>Users/Reps</span>
        </div>

        <div className="short text-white font-medium flex items-center gap-2">
          <input
            type="checkbox"
            className="h-[20px] w-[20px]"
            onChange={handleTeamMemberChange}
            checked={teamMembersChecked}
          />
          <span>Team Member</span>
        </div>
      </div> */}


      <div className="short text-white font-medium flex items-center gap-2">
        <input
          type="checkbox"
          className="h-[20px] w-[20px]"
          onChange={handleAdminChange}
          checked={adminChecked}
        />
        <span>Admin</span>
      </div>

        <div className="short text-white font-medium flex items-center gap-2">
        <input
          type="checkbox"
          className="h-[20px] w-[20px]"
          onChange={handleManagersChange}
          checked={managersChecked}
        />
        <span>Managers</span>
        </div>

        <div className="short text-white font-medium flex items-center gap-2">
          <input
            type="checkbox"
            className="h-[20px] w-[20px]"
            onChange={handleTeamLeadersChange}
            checked={teamLeadersChecked}
          />
        <span>Team Leaders</span>
        </div>

        <div className="short text-white font-medium flex items-center gap-2">
          <input
            type="checkbox"
            className="h-[20px] w-[20px]"
            onChange={handleUsersChange}
            checked={usersChecked}
          />
          <span>Users/Reps</span>
        </div>

        <div className="short text-white font-medium flex items-center gap-2">
          <input
            type="checkbox"
            className="h-[20px] w-[20px]"
            onChange={handleTeamMemberChange}
            checked={teamMembersChecked}
          />
          <span>Team Member</span>
        </div>
      </div>

      <div className="user_cont my-5">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-fit bg-tracer-blue hover:bg-tracer-blue/90 text-white py-3 px-5 rounded font-medium uppercase transition duration-200 block"
        >
          Add User
        </button>
      </div>

      <div className="user_data_wrap">
        <div className="user_dataHead w-full px-5 py-4 rounded bg-gray-700 text-white flex gap-4">
          <div className="userData w-[20%] font-bold">First Name</div>
          <div className="userData w-[20%] font-bold">Last Name</div>
          <div className="userData w-[20%] font-bold">Email</div>
          <div className="userData w-[20%] font-bold">Phone Number</div>
          <div className="userData w-[20%] font-bold">Role</div>
        </div>
      </div>

      <div className="user_body w-full text-white mt-5">
        {isLoading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-4">No users found</div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="UserDataRow group px-5 py-3 rounded flex gap-4 border border-gray-700 mt-4 hover:bg-gray-700 cursor-pointer relative"
            >
              <div className="userdata w-[20%]">{user.first_name}</div>
              <div className="userdata w-[20%]">{user.last_name}</div>
              <div className="userdata w-[20%]">{user.email}</div>
              <div className="userdata w-[20%]">{user.phone}</div>
              <div className="userdata w-[20%]">
                {
                  ROLE_MAPPING[
                    user.role_id.toString() as keyof typeof ROLE_MAPPING
                  ]
                }
              </div>
              <div className="edit-delete-btn absolute right-5 hidden group-hover:block">
                <div className="edit_data flex gap-2 items-center">
                  <button
                    onClick={() => handleEdit(user)}
                    className="hover:text-tracer-green"
                  >
                    <Edit />
                  </button>
                  {user.role_id != 1 && (
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setDeleteModalOpen(true);
                      }}
                      className="hover:text-red-500"
                    >
                      <Trash />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Add New User</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                    required
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.first_name[0]}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                    required
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.last_name[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                    required
                  />

                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email[0]}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-300 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                  required
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pr-10 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Role</label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                  required
                >

                  {/* {role_id === 1 && <option value="2">Admin</option>}
                  {(role_id === 1) && (role_id === 2) && <option value="3">Manager</option>}
                  {(role_id === 1) && (role_id === 2) && (role_id === 3) && <option value="4">Team Leader</option>} */}

                  <option value="2">Admin</option>
                  <option value="3">Manager</option>
                  <option value="4">Team Leader</option>
            
                  <option value="5">User</option>
                  <option value="6">Team Member</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-tracer-green hover:bg-tracer-green/90 disabled:bg-tracer-green/70 disabled:cursor-not-allowed text-white py-3 px-5 rounded font-medium uppercase transition duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating User...
                    </>
                  ) : (
                    "Add User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-xl relative">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedUser(null);
                setFormData({
                  first_name: "",
                  last_name: "",
                  email: "",
                  phone: "",
                  password: "",
                  role_id: "5",
                  birthday: "",
                });
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Edit User</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-300 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pr-10 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showEditPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Role</label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-green"
                  required
                >

                  {/* {role_id === 1 && <option value="2">Admin</option>}
                  {(role_id === 1) && (role_id === 2) && <option value="3">Manager</option>}
                  {(role_id === 1) && (role_id === 2) && (role_id === 3) && <option value="4">Team Leader</option>} */}
                  <option value="2">Admin</option>
                  <option value="3">Manager</option>
                  <option value="4">Team Leader</option>
                  <option value="5">User</option>
                  <option value="6">Team Member</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-tracer-green hover:bg-tracer-green/90 disabled:bg-tracer-green/70 disabled:cursor-not-allowed text-white py-3 px-5 rounded font-medium uppercase transition duration-200 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating User...
                    </>
                  ) : (
                    "Update User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-md relative">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedUser(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash className="h-6 w-6 text-red-600" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Delete User
              </h3>

              <p className="text-gray-300 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {selectedUser.first_name} {selectedUser.last_name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedUser.id)}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
