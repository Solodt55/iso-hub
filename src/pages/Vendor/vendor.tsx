import { Edit, Trash, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

interface VendorFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface ApiResponse {
  message: string;
  data: Vendor[];
}

export default function Vendor() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchVendors = async (id?: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendor/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: id ? JSON.stringify({ id }) : undefined,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }
      const data: ApiResponse = await response.json();
      setVendors(data.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVendorById = async (id: string) => {
    await fetchVendors(id);
  };

  useEffect(() => {
    fetchVendors();
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendor/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create vendor');
      }

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
      setIsModalOpen(false);
      
      // Refresh the vendors list
      fetchVendors();
    } catch (error) {
      console.error('Error creating vendor:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendor/destroy/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete vendor');
      }

      // Close the delete modal
      setDeleteModalOpen(false);
      setSelectedVendor(null);

      // Refresh the vendors list after successful deletion
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendor/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          id: selectedVendor.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update vendor');
      }

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
      setIsEditModalOpen(false);
      setSelectedVendor(null);
      
      // Refresh the vendors list
      fetchVendors();
    } catch (error) {
      console.error('Error updating vendor:', error);
    }
  };

  return (
    <>
      <div className="user_cont my-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-fit bg-tracer-blue hover:bg-tracer-blue/90 text-white py-3 px-5 rounded font-medium uppercase transition duration-200 block"
        >
          Add Vendor
        </button>
      </div>

      <div className="user_data_wrap">
        <div className="user_dataHead w-full px-5 py-4 rounded bg-gray-700 text-white flex gap-4">
          <div className="userData w-[20%] font-bold">Name</div>
          <div className="userData w-[20%] font-bold">Email</div>
          <div className="userData w-[20%] font-bold">Phone Number</div>
          <div className="userData w-[20%] font-bold">Address</div>
        </div>
      </div>

      <div className="user_body w-full text-white mt-5">
        {isLoading ? (
          <div className="text-center py-4">Loading vendors...</div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-4">No vendors found</div>
        ) : (
          vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="UserDataRow group px-5 py-3 rounded flex gap-4 border border-gray-700 mt-4 hover:bg-gray-700 cursor-pointer relative"
            >
              <div className="userdata w-[20%]">{vendor.name}</div>
              <div className="userdata w-[20%]">{vendor.email}</div>
              <div className="userdata w-[20%]">{vendor.phone}</div>
              <div className="userdata w-[20%]">{vendor.address}</div>
              <div className="edit-delete-btn absolute right-5 hidden group-hover:block">
                <div className="edit_data flex gap-2 items-center">
                  <button 
                    onClick={() => handleEdit(vendor)}
                    className="hover:text-yellow-500"
                  >
                    <Edit />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedVendor(vendor);
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

      {/* Add Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Add New Vendor</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-tracer-blue hover:bg-tracer-blue/90 text-white py-3 px-5 rounded font-medium uppercase transition duration-200"
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {isEditModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-xl relative">
            <button 
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedVendor(null);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  address: ''
                });
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Edit Vendor</h2>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-tracer-blue hover:bg-tracer-blue/90 text-white py-3 px-5 rounded font-medium uppercase transition duration-200"
                >
                  Update Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-md relative">
            <button 
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedVendor(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Delete Vendor</h3>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedVendor.name}</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSelectedVendor(null);
                  }}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedVendor.id)}
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
