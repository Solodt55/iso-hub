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
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [hoveredRole, setHoveredRole] = useState<any>(null);

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

  const AVAILABLE_PERMISSIONS = [
    { id: 1, name: "team_member.add", group_name: "team_member" },
    { id: 2, name: "team_member.edit", group_name: "team_member" },
    { id: 3, name: "team_member.delete", group_name: "team_member" },
    { id: 4, name: "team_member.view", group_name: "team_member" },
    { id: 5, name: "vendor.add", group_name: "vendor" },
    { id: 6, name: "vendor.edit", group_name: "vendor" },
    { id: 7, name: "vendor.delete", group_name: "vendor" },
    { id: 8, name: "vendor.view", group_name: "vendor" },
    { id: 9, name: "user.add", group_name: "user" },
    { id: 10, name: "user.edit", group_name: "user" },
    { id: 11, name: "user.delete", group_name: "user" },
    { id: 12, name: "user.view", group_name: "user" },
    { id: 13, name: "secure_file_uploads.view", group_name: "secure_file_uploads" },
    { id: 14, name: "jotform.view", group_name: "all" },
    { id: 15, name: "jotform.create", group_name: "all" },
    { id: 16, name: "jotform.edit", group_name: "all" },
    { id: 17, name: "jotform.delete", group_name: "all" },
  ];



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

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/role/view`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      const data = await response.json();
      setRoles(data.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to fetch roles");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles(); // Fetch roles when admin page loads
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

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions.map((p: any) => p.id));
    setIsEditRoleModalOpen(true);
  };

  const handleCreateRole = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/role/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newRoleName,
            permission: selectedPermissions,
          }),
        }
      );

      const data = await response.json();

      // Handle Laravel-style validation error (422 status with validation errors)
      if (response.status === 422 && data.message === "Validation failed" && typeof data.errors === "object") {
        const validationErrors = data.errors;
        Object.values(validationErrors).forEach((fieldErrors: any) => {
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((msg: string) => toast.error(msg));
          }
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to create role");
      }

      toast.success("Role created successfully");
      setIsCreateRoleModalOpen(false);
      setNewRoleName("");
      setSelectedPermissions([]);
      fetchRoles();
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("Failed to create role");
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/role/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: selectedRole.name, // Include the role name as required by backend
            role_id: selectedRole.id,
            permission: selectedPermissions,
          }),
        }
      );

      const data = await response.json();

      // Handle Laravel-style validation error (422 status with validation errors)
      if (response.status === 422 && data.message === "Validation failed" && typeof data.errors === "object") {
        const validationErrors = data.errors;
        Object.values(validationErrors).forEach((fieldErrors: any) => {
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((msg: string) => toast.error(msg));
          }
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to update role");
      }

      toast.success("Role updated successfully");
      setIsEditRoleModalOpen(false);
      setSelectedRole(null);
      setSelectedPermissions([]);
      fetchRoles();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/role/delete/${roleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete role");
      }

      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Failed to delete role");
    }
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
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

      {/* User Type Filter Dropdown */}
      <div className="user-type-filter flex gap-4 items-center my-10 w-full">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-fit bg-tracer-blue hover:bg-tracer-blue/90 text-white py-3 px-5 rounded font-medium uppercase transition duration-200 block"
        >
          Add User
        </button>
        {/* <button
          onClick={() => setIsRoleModalOpen(true)}
          className="w-fit bg-tracer-green hover:bg-tracer-green/90 text-white py-3 px-5 rounded font-medium uppercase transition duration-200 block"
        >
          MANAGE ROLES
        </button> */}
        <select
          className="ml-4 px-4 py-3 rounded font-medium uppercase bg-white border-2 border-tracer-green text-tracer-green focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green transition duration-200 block"
          style={{ minWidth: '180px' }}
          value={(() => {
            if (adminChecked) return 'admin';
            if (managersChecked) return 'manager';
            if (teamLeadersChecked) return 'team_leader';
            if (usersChecked) return 'user';
            if (teamMembersChecked) return 'team_member';
            return '';
          })()}
          onChange={e => {
            setAdminChecked(false);
            setManagersChecked(false);
            setTeamLeadersChecked(false);
            setUsersChecked(false);
            setTeamMembersChecked(false);
            switch (e.target.value) {
              case 'admin': setAdminChecked(true); break;
              case 'manager': setManagersChecked(true); break;
              case 'team_leader': setTeamLeadersChecked(true); break;
              case 'user': setUsersChecked(true); break;
              case 'team_member': setTeamMembersChecked(true); break;
              default: break;
            }
          }}
        >
          <option value="">All User Types</option>
          <option value="admin">Admin</option>
          <option value="manager">Managers</option>
          <option value="team_leader">Team Leaders</option>
          <option value="user">Users/Reps</option>
          <option value="team_member">Team Member</option>
        </select>
      </div>



      <div className="user_data_wrap">
        <div className="user_dataHead w-full px-5 py-4 rounded bg-gray-100 text-gray-800 flex gap-4 border border-gray-200">
          <div className="userData w-[20%] font-bold">First Name</div>
          <div className="userData w-[20%] font-bold">Last Name</div>
          <div className="userData w-[20%] font-bold">Email</div>
          <div className="userData w-[20%] font-bold">Phone Number</div>
          <div className="userData w-[20%] font-bold">Role</div>
        </div>
      </div>

      <div className="user_body w-full text-gray-800 mt-5">
        {isLoading ? (
          <div className="text-center py-4 text-gray-600">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-4 text-gray-600">No users found</div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="UserDataRow group px-5 py-3 rounded flex gap-4 border border-gray-200 mt-4 hover:bg-gray-50 cursor-pointer relative bg-white"
            >
              <div className="userdata w-[20%] whitespace-normal break-all">{user.first_name}</div>
              <div className="userdata w-[20%] whitespace-normal break-all">{user.last_name}</div>
              <div className="userdata w-[20%] whitespace-normal break-all">{user.email}</div>
              <div className="userdata w-[20%] whitespace-normal break-all">{user.phone}</div>
              <div className="userdata w-[20%] whitespace-normal break-all">
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
          <div className="bg-white p-8 rounded-lg w-full max-w-xl relative shadow-xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New User</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.first_name[0]}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
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
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  />

                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email[0]}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                  required
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pr-10 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                <label className="block text-gray-700 mb-2">Role</label>
                <div className="relative">
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option 
                        key={role.id} 
                        value={role.id}
                        onMouseEnter={() => setHoveredRole(role)}
                        onMouseLeave={() => setHoveredRole(null)}
                      >
                        {role.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Hover tooltip */}
                  {hoveredRole && (
                    <div className="absolute left-full top-0 ml-2 z-50 bg-gray-800 text-white p-3 rounded shadow-lg max-w-xs">
                      <h4 className="font-semibold mb-2">{hoveredRole.name} Permissions:</h4>
                      <ul className="text-sm space-y-1">
                        {hoveredRole.permissions.map((permission: any) => (
                          <li key={permission.id} className="text-gray-300">
                            • {permission.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-tracer-green hover:bg-tracer-blue disabled:bg-tracer-green/70 disabled:cursor-not-allowed text-white py-3 px-5 rounded font-medium uppercase transition duration-200 flex items-center justify-center gap-2"
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
          <div className="bg-white p-8 rounded-lg w-full max-w-xl relative shadow-xl">
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
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit User</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pr-10 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showEditPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Role</label>
                <div className="relative">
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option 
                        key={role.id} 
                        value={role.id}
                        onMouseEnter={() => setHoveredRole(role)}
                        onMouseLeave={() => setHoveredRole(null)}
                      >
                        {role.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Hover tooltip */}
                  {hoveredRole && (
                    <div className="absolute left-full top-0 ml-2 z-50 bg-gray-800 text-white p-3 rounded shadow-lg max-w-xs">
                      <h4 className="font-semibold mb-2">{hoveredRole.name} Permissions:</h4>
                      <ul className="text-sm space-y-1">
                        {hoveredRole.permissions.map((permission: any) => (
                          <li key={permission.id} className="text-gray-300">
                            • {permission.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-tracer-green hover:bg-tracer-blue disabled:bg-tracer-green/70 disabled:cursor-not-allowed text-white py-3 px-5 rounded font-medium uppercase transition duration-200 flex items-center justify-center gap-2"
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
          <div className="bg-white p-8 rounded-lg w-full max-w-md relative shadow-xl">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedUser(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash className="h-6 w-6 text-red-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Delete User
              </h3>

              <p className="text-gray-600 mb-6">
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
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-200"
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

      {/* Role Management Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-4xl relative shadow-xl max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsRoleModalOpen(false);
                // No need to fetchRoles again since we already have them
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Roles</h2>

            <div className="mb-6">
              <button
                onClick={() => setIsCreateRoleModalOpen(true)}
                className="bg-tracer-green hover:bg-tracer-green/90 text-white py-2 px-4 rounded font-medium uppercase transition duration-200"
              >
                Create New Role
              </button>
            </div>

            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="border border-gray-200 rounded p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{role.name}</h3>
                    <p className="text-gray-600">
                      {role.permissions.length} permission(s): {role.permissions.map((p: any) => p.name).join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="bg-tracer-blue hover:bg-tracer-blue/90 text-white py-1 px-3 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {isCreateRoleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-2xl relative shadow-xl max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsCreateRoleModalOpen(false);
                setNewRoleName("");
                setSelectedPermissions([]);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Role</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Role Name</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tracer-green focus:border-tracer-green"
                  placeholder="Enter role name"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-300 rounded p-4">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <label key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{permission.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setIsCreateRoleModalOpen(false);
                    setNewRoleName("");
                    setSelectedPermissions([]);
                  }}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRole}
                  disabled={!newRoleName.trim()}
                  className="px-4 py-2 rounded bg-tracer-green text-white hover:bg-tracer-green/90 disabled:bg-gray-400 transition duration-200"
                >
                  Create Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {isEditRoleModalOpen && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-2xl relative shadow-xl max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsEditRoleModalOpen(false);
                setSelectedRole(null);
                setSelectedPermissions([]);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Role: {selectedRole.name}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Current Permissions</label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-300 rounded p-4">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <label key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{permission.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setIsEditRoleModalOpen(false);
                    setSelectedRole(null);
                    setSelectedPermissions([]);
                  }}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  className="px-4 py-2 rounded bg-tracer-blue text-white hover:bg-tracer-blue/90 transition duration-200"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
