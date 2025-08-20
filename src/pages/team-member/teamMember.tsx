import { Edit, Trash, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TeamMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role_id: number;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface TeamMemberFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  role_id: string;
}

interface ApiResponse {
  message: string;
  data: TeamMember[];
}

export default function TeamMember() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<TeamMemberFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role_id: ''
  });

  const fetchTeamMembers = async (id?: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/team-member/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: id ? JSON.stringify({ id }) : undefined,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      const data: ApiResponse = await response.json();
      setTeamMembers(data.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMemberById = async (id: string) => {
    await fetchTeamMembers(id);
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token'); 
      formData.role_id = "6";
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/team-member/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create team member');
      }

      // Reset form and close modal
      setFormData({
       first_name: '',
       last_name: '',
       email: '',
       phone: '',
       password: '',
       role_id: ''
      });
      setIsModalOpen(false);
      
      // Refresh the team members list
      fetchTeamMembers();
    } catch (error) {
      console.error('Error creating team member:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/team-member/destroy/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete team member');
      }

      // Close the delete modal
      setDeleteModalOpen(false);
      setSelectedMember(null);

      // Refresh the team members list after successful deletion
      fetchTeamMembers();
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone,
      password: '',
      role_id: ''
      // role_id: member.role_id
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      const token = localStorage.getItem('auth_token');
      formData.role_id = "6";
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/team-member/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          id: selectedMember.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update team member');
      }

      // Reset form and close modal
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        role_id: ''
      });
      setIsEditModalOpen(false);
      setSelectedMember(null);
      
      // Refresh the team members list
      fetchTeamMembers();
    } catch (error) {
      console.error('Error updating team member:', error);
    }
  };

  return (
    <>
      <div className="user_cont my-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-fit bg-tracer-blue hover:bg-tracer-blue/90 text-white py-3 px-5 rounded font-medium uppercase transition duration-200 block"
        >
          Add Team Member
        </button>
      </div>

      <div className="user_data_wrap">
        <div className="user_dataHead w-full px-5 py-4 rounded bg-gray-700 text-white flex gap-4">
          <div className="userData w-[20%] font-bold">First Name</div>
          <div className="userData w-[20%] font-bold">Last Name</div>
          <div className="userData w-[20%] font-bold">Email</div>
          <div className="userData w-[20%] font-bold">Phone Number</div>
          {/* <div className="userData w-[20%] font-bold">Address</div> */}
        </div>
      </div>

      <div className="user_body w-full text-white mt-5">
        {isLoading ? (
          <div className="text-center py-4">Loading team members...</div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-4">No team members found</div>
        ) : (
          teamMembers.map((member) => (
            <div
              key={member.id}
              className="UserDataRow group px-5 py-3 rounded flex gap-4 border border-gray-700 mt-4 hover:bg-gray-700 cursor-pointer relative"
            >
              <div className="userdata w-[20%]">{member.first_name}</div>
              <div className="userdata w-[20%]">{member.last_name}</div>
              <div className="userdata w-[20%]">{member.email}</div>
              <div className="userdata w-[20%]">{member.phone}</div>
              {/* <div className="userdata w-[20%]">{member.address}</div> */}
              <div className="edit-delete-btn absolute right-5 hidden group-hover:block">
                <div className="edit_data flex gap-2 items-center">
                  <button 
                    onClick={() => handleEdit(member)}
                    className="hover:text-tracer-blue"
                  >
                    <Edit />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedMember(member);
                      setDeleteModalOpen(true);
                    }}
                    className="hover:text-red-500"
                  >
                    <Trash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Team Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Add New Team Member</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-blue"
                  required
                />
              </div> */}

              <input type="hidden" name="role_id" value="6"/>
    

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-blue"
                    required
                  />
                  {/* {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.first_name[0]}</p>
                  )} */}
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-blue"
                    required
                  />
                  {/* {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.last_name[0]}</p>
                  )} */}
                </div>
              </div>

              
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-blue"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-blue"
                  required
                />
                {/* {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>
                )} */}
              </div>
              
              {/* <div>
                <label className="block text-gray-300 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-blue"
                  required
                />
              </div> */}

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-tracer-blue hover:bg-tracer-blue/90 text-white py-3 px-5 rounded font-medium uppercase transition duration-200"
                >
                  Add Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Member Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-xl relative">
            <button 
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedMember(null);
                setFormData({
                  first_name: '',
                  last_name: '',
                  email: '',
                  phone: '',
                  password: '',
                  role_id: ''
                });
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Edit Team Member</h2>
            
            <form onSubmit={handleUpdate} className="space-y-4">

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-blue"
                    required
                  />

                </div>

                <input type="hidden" name="role_id" value="6"/>
                
                <div className="w-1/2">
                  <label className="block text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-blue"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-blue"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-blue"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-tracer-blue"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-tracer-blue hover:bg-tracer-blue/90 text-white py-3 px-5 rounded font-medium uppercase transition duration-200"
                >
                  Update Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-md relative">
            <button 
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedMember(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Delete Team Member</h3>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedMember.first_name}</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSelectedMember(null);
                  }}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedMember.id)}
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
