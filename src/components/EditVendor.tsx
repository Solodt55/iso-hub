import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

interface EditVendorProps {
  vendorId: number;
  onClose: () => void;
  onUpdated: () => void;
}

interface VendorTemplate {
  id: number;
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  logo_url: string;
  login_url: string;
  rep_name: string;
  rep_email: string;
  rep_phone: string;
  notes: string;
  support_info: string;
  description: string;
  vendor_type: string;
}

const EditVendor: React.FC<EditVendorProps> = ({ vendorId, onClose, onUpdated }) => {
  const [vendor, setVendor] = useState<VendorTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string } | null>(null);

  useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem('auth_token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendor/edit-vendor`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: vendorId }),
        });
        const data = await response.json();
        if (data.status === 'success') {
          setVendor(data.data);
        } else {
          toast.error('Failed to fetch vendor details');
          onClose();
        }
      } catch (err) {
        toast.error('Error fetching vendor details');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [vendorId, onClose]);

  const handleChange = (field: keyof VendorTemplate, value: string) => {
    setVendor((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;
    setSaving(true);
    setFieldErrors(null); // Reset errors
    try {
      const accessToken = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('id', String(vendor.id));
      formData.append('vendor_name', vendor.vendor_name);
      formData.append('vendor_email', vendor.vendor_email);
      formData.append('vendor_phone', vendor.vendor_phone);
      formData.append('login_url', vendor.login_url);
      formData.append('rep_name', vendor.rep_name);
      formData.append('rep_email', vendor.rep_email);
      formData.append('rep_phone', vendor.rep_phone);
      formData.append('notes', vendor.notes);
      formData.append('support_info', vendor.support_info);
      formData.append('description', vendor.description);
      if (logoFile) {
        formData.append('logo_url', logoFile);
      }
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendor/update-vendor`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Vendor updated successfully');
        onUpdated();
        onClose();
      } else {
        // Laravel validation error handling
        if (data.message && typeof data.message === 'object' && !Array.isArray(data.message)) {
          // Type assertion for error object
          const errorObj = data.message as Record<string, string[]>;
          const firstError = Object.values(errorObj)[0]?.[0] || 'Validation error';
          toast.error(firstError);
          setFieldErrors(
            Object.fromEntries(
              Object.entries(errorObj).map(([k, v]) => [k, v[0] || ''])
            )
          );
        } else {
          toast.error('Failed to update vendor');
        }
      }
    } catch (err) {
      toast.error('Error updating vendor');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !vendor) {
    return (
      <div className="p-8 text-center">Loading vendor details...</div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-sans">
      <div className="bg-white rounded-xl shadow-lg p-4 max-w-xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Vendor</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Vendor Name</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1 text-sm text-gray-800"
                value={vendor.vendor_name}
                onChange={e => handleChange('vendor_name', e.target.value)}
              />
              {fieldErrors?.vendor_name && (
                <div className="text-xs text-red-600 mt-1">{fieldErrors.vendor_name}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700">Vendor Email</label>
              <input
                type="email"
                className="w-full border rounded px-2 py-1 text-sm text-gray-800"
                value={vendor.vendor_email}
                onChange={e => handleChange('vendor_email', e.target.value)}
              />
              {fieldErrors?.vendor_email && (
                <div className="text-xs text-red-600 mt-1">{fieldErrors.vendor_email}</div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700">Vendor Phone</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1 text-sm text-gray-800"
                value={vendor.vendor_phone}
                onChange={e => handleChange('vendor_phone', e.target.value)}
              />
              {fieldErrors?.vendor_phone && (
                <div className="text-xs text-red-600 mt-1">{fieldErrors.vendor_phone}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700">Login URL</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1 text-sm text-gray-800"
                value={vendor.login_url}
                onChange={e => handleChange('login_url', e.target.value)}
              />
              {fieldErrors?.login_url && (
                <div className="text-xs text-red-600 mt-1">{fieldErrors.login_url}</div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700">Contact name</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1 text-sm text-gray-800"
                value={vendor.rep_name}
                onChange={e => handleChange('rep_name', e.target.value)}
              />
              {fieldErrors?.rep_name && (
                <div className="text-xs text-red-600 mt-1">{fieldErrors.rep_name}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700">Contact email</label>
              <input
                type="email"
                className="w-full border rounded px-2 py-1 text-sm text-gray-800"
                value={vendor.rep_email}
                onChange={e => handleChange('rep_email', e.target.value)}
              />
              {fieldErrors?.rep_email && (
                <div className="text-xs text-red-600 mt-1">{fieldErrors.rep_email}</div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700">Rep Phone</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1 text-sm text-gray-800"
                value={vendor.rep_phone}
                onChange={e => handleChange('rep_phone', e.target.value)}
              />
              {fieldErrors?.rep_phone && (
                <div className="text-xs text-red-600 mt-1">{fieldErrors.rep_phone}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700">Support Info</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1 text-sm text-gray-800"
                value={vendor.support_info}
                onChange={e => handleChange('support_info', e.target.value)}
              />
              {fieldErrors?.support_info && (
                <div className="text-xs text-red-600 mt-1">{fieldErrors.support_info}</div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700">Logo</label>
              <input
                type="file"
                accept="image/*"
                className="w-full border rounded px-2 py-1 text-sm text-gray-800"
                onChange={handleLogoChange}
              />
              {(logoPreview || vendor.logo_url) && (
                <img
                  src={
                    logoPreview?.startsWith('blob:')
                      ? logoPreview // Use the blob URL directly
                      : `${import.meta.env.VITE_IMAGE_URL}${vendor.logo_url}` // Fallback to Laravel image
                  }
                  alt="Vendor Logo"
                  className="h-12 w-12 rounded-full object-cover mt-2 border"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700">Notes</label>
            <textarea
              className="w-full border rounded px-2 py-1 text-sm text-gray-800"
              value={vendor.notes}
              onChange={e => handleChange('notes', e.target.value)}
            />
            {fieldErrors?.notes && (
              <div className="text-xs text-red-600 mt-1">{fieldErrors.notes}</div>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-700">Description</label>
            <textarea
              className="w-full border rounded px-2 py-1 text-sm text-gray-800"
              value={vendor.description}
              onChange={e => handleChange('description', e.target.value)}
            />
            {fieldErrors?.description && (
              <div className="text-xs text-red-600 mt-1">{fieldErrors.description}</div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-tracer-green text-white text-sm rounded hover:bg-tracer-green/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );


};

export default EditVendor; 