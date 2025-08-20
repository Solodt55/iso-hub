// src/pages/Reps/reps.tsx
import React, { useState, useEffect } from 'react';
import { Edit, Trash, X, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

interface Rep {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  role_id: number;
  email_verified_at: string | null;
  unique_string: string | null;
  created_at: string;
  updated_at: string;
}

interface RepModalProps {
  onClose: () => void;
  onSave: () => void;
  fetchReps: () => Promise<void>;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  user_id: number | '';
}

interface EditRepModalProps {
  rep: Rep | null;
  onClose: () => void;
  onUpdate: () => void;
  users: User[];
}

const getUserDisplayName = (user: User) => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  } else if (user.first_name) {
    return user.first_name;
  } else {
    return user.email;
  }
};

const RepModal: React.FC<RepModalProps> = ({ onClose, onSave, fetchReps }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    user_id: ''
  });
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reps/get-rep-user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      // console.log(data,'rep data');
      if (data.status === 'success') {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reps/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 422) {
          setErrors(data.errors || {});
          Object.keys(data.errors || {}).forEach((key) => {
            data.errors[key].forEach((errorMsg: string) => {
              toast.error(errorMsg);
            });
          });
        } else {
          throw new Error(data.message || 'Form submission failed');
        }
        return;
      }

      if (data.status === 'success') {
        toast.success(data.message || 'Rep created successfully');
        await fetchReps(); // Wait for the reps to be fetched
        onClose();
      } else {
        throw new Error(data.message || 'Form submission failed');
      }
    } catch (error) {
      console.error('Error creating rep:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create rep');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'user_id' ? (value ? parseInt(value) : '') : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-lg w-[500px] relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Add New Rep</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-gray-400 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Phone</label>
            <input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-400"
              required
            />
          </div>

           <div>
            <label className="block text-gray-400 mb-2">User</label>
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {getUserDisplayName(user)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-tracer-green text-white py-2 rounded font-medium hover:bg-tracer-green/90 transition-colors mt-6 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'ADD REP'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const EditRepModal: React.FC<EditRepModalProps> = ({ rep, onClose, onUpdate, users }) => {
  const [formData, setFormData] = useState({
    name: rep?.name || '',
    email: rep?.email || '',
    phone: rep?.phone || '',
    address: rep?.address || '',
    user_id: rep?.user_id || '',
    id: rep?.id || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'user_id' ? (value ? parseInt(value) : '') : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reps/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 422) {
          setErrors(data.errors || {});
          Object.keys(data.errors || {}).forEach((key) => {
            data.errors[key].forEach((errorMsg: string) => {
              toast.error(errorMsg);
            });
          });
        } else {
          throw new Error(data.message || 'Update failed');
        }
        return;
      }

      if (data.status === 'success') {
        toast.success(data.message || 'Rep updated successfully');
        onUpdate();
        onClose();
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating rep:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update rep');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-lg w-[500px] relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Edit Rep</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-gray-400 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Phone</label>
            <input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">User</label>
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {getUserDisplayName(user)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-tracer-green text-white py-2 rounded font-medium hover:bg-tracer-green/90 transition-colors mt-6 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'UPDATE REP'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function Reps() {
  const [reps, setReps] = useState<Rep[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRep, setSelectedRep] = useState<Rep | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReps = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reps/lists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reps');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        setReps(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch reps');
      }
    } catch (error) {
      console.error('Error fetching reps:', error);
      toast.error('Failed to fetch reps');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reps/get-rep-user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        setUsers(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchReps();
    fetchUsers();
  }, []);

  const handleDeleteRep = async (id: number) => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reps/destroy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error('Failed to delete rep');
      }

      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Rep deleted successfully');
        fetchReps();
      } else {
        throw new Error(data.message || 'Failed to delete rep');
      }
    } catch (error) {
      console.error('Error deleting rep:', error);
      toast.error('Failed to delete rep');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedRep(null);
    }
  };

  const handleDeleteClick = (rep: Rep) => {
    setSelectedRep(rep);
    setShowDeleteModal(true);
  };

  const handleEditClick = (rep: Rep) => {
    setSelectedRep(rep);
    setShowEditModal(true);
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      
      <button
        onClick={() => setShowModal(true)}
        className="bg-tracer-green text-white px-6 py-2 rounded font-medium hover:bg-tracer-green/90 transition-colors mb-6"
      >
        ADD REP
      </button>

      <div className="bg-zinc-900 rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-4 bg-zinc-800 p-4 text-gray-300 font-medium">
          <div>Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Address</div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
          </div>
        ) : reps.length === 0 ? (
          <div className="flex justify-center py-8 text-gray-400">
            No reps found
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {reps.map((rep) => (
              <div
                key={rep.id}
                className="grid grid-cols-4 gap-4 p-4 text-gray-300 group hover:bg-zinc-800 relative"
              >
                <div>{rep.name}</div>
                <div>{rep.email}</div>
                <div>{rep.phone}</div>
                <div>{rep.address}</div>
                
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditClick(rep)}
                    className="text-yellow-400 hover:text-yellow-500"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(rep)}
                    className="text-red-400 hover:text-red-500"
                    disabled={isDeleting}
                  >
                    {isDeleting && selectedRep?.id === rep.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <RepModal
          onClose={() => setShowModal(false)}
          onSave={fetchReps}
          fetchReps={fetchReps}
        />
      )}

      {showEditModal && selectedRep && (
        <EditRepModal
          rep={selectedRep}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRep(null);
          }}
          onUpdate={fetchReps}
          users={users}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-md relative">
            <button 
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedRep(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Delete Rep</h3>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedRep.name}</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRep(null);
                  }}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteRep(selectedRep.id)}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition duration-200"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
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