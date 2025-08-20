import React, { useState, useRef, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  Search,
  ExternalLink,
  ChevronDown,
  CreditCard,
  Router,
  HardDrive,
  X,
  Pencil,
  Trash2,
  Shield
} from "lucide-react";
import axios from "axios";
import EditVendor from '../components/EditVendor';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { UniqueIdentifier, DragEndEvent } from '@dnd-kit/core';

// const value = localStorage.getItem("auth_user");
// const parsedUser = value ? JSON.parse(value) : null;
// const roleId = parsedUser.role_id;

const categoryIds = ['processors', 'gateways', 'hardware', 'internal'];

interface VendorTemplate {
  id: number;
  user_id: number;
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
  created_at: string;
  updated_at: string;
}

interface VendorCard {
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  logo_url: string | null;
  logoFile: File | null;
  login_url: string;
  rep_name: string;
  rep_email: string;
  rep_phone: string;
  notes: string;
  support_info: string;
  description: string;
  vendor_type: string;
  role_id: string;
}

interface VendorLoginModalProps {
  vendor: VendorTemplate;
  onClose: () => void;
}

function VendorLoginModal({ vendor, onClose }: VendorLoginModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md relative shadow-2xl border border-tracer-blue/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-tracer-green transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Top Row: Logo | Name | Link */}
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* Logo */}
          {vendor.logo_url ? (
            vendor.login_url ? (
              <a href={vendor.login_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={`${import.meta.env.VITE_IMAGE_URL}${vendor.logo_url}`}
                  alt={vendor.vendor_name}
                  className="w-14 h-14 object-contain rounded-full border-2 border-tracer-green bg-white shadow"
                />
              </a>
            ) : (
              <img
                src={`${import.meta.env.VITE_IMAGE_URL}${vendor.logo_url}`}
                alt={vendor.vendor_name}
                className="w-14 h-14 object-contain rounded-full border-2 border-tracer-green bg-white shadow"
              />
            )
          ) : (
            <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-tracer-green">
              <span className="text-2xl font-bold text-tracer-green">
                {vendor.vendor_name.charAt(0)}
              </span>
            </div>
          )}

          {/* Vendor Name */}
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-extrabold text-tracer-green drop-shadow mb-1">{vendor.vendor_name}</h2>
            <p className="text-gray-400 text-xs tracking-wide">Vendor Portal</p>
          </div>

          {/* External Link */}
          <a
            href={vendor.login_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-700 transition-colors bg-zinc-800 p-2 rounded-full border border-green-500 shadow"
            title="Open Login URL"
          >
            <ExternalLink className="h-6 w-6" />
          </a>
        </div>

        {/* Vendor Information Section */}
        <div className="space-y-2 mb-4">
          {vendor.vendor_email && (
            <div className="flex items-center bg-zinc-800/70 rounded px-3 py-2 text-sm">
              <span className="font-semibold text-tracer-green w-28">Email:</span>
              <span className="text-gray-200">{vendor.vendor_email}</span>
            </div>
          )}
          {vendor.vendor_phone && (
            <div className="flex items-center bg-zinc-800/70 rounded px-3 py-2 text-sm">
              <span className="font-semibold text-tracer-green w-28">Phone:</span>
              <span className="text-gray-200">{vendor.vendor_phone}</span>
            </div>
          )}
          {vendor.rep_name && (
            <div className="flex items-center bg-zinc-800/70 rounded px-3 py-2 text-sm">
              <span className="font-semibold text-tracer-green w-28">Contact Name:</span>
              <span className="text-gray-200">{vendor.rep_name}</span>
            </div>
          )}


          {vendor.rep_email && (
            <div className="flex items-center bg-zinc-800/70 rounded px-3 py-2 text-sm">
              <span className="font-semibold text-tracer-green w-28">Contact Email:</span>
              <span className="text-gray-200">{vendor.rep_email}</span>
            </div>
          )}

          {vendor.support_info && (
            <div className="flex items-center bg-zinc-800/70 rounded px-3 py-2 text-sm">
              <span className="font-semibold text-tracer-green w-28">Support:</span>
              <span className="text-gray-200">{vendor.support_info}</span>
            </div>
          )}

          {vendor.rep_phone && (
            <div className="flex items-center bg-zinc-800/70 rounded px-3 py-2 text-sm">
              <span className="font-semibold text-tracer-green w-28">Rep Phone:</span>
              <span className="text-gray-200">{vendor.rep_phone}</span>
            </div>
          )}

          {vendor.notes && (
            <div className="flex items-center bg-zinc-800/70 rounded px-3 py-2 text-sm">
              <span className="font-semibold text-tracer-green w-28">Notes:</span>
              <span className="text-gray-200">{vendor.notes}</span>
            </div>
          )}
        </div>

        <div className="bg-tracer-green/10 rounded-lg p-4 mt-4">
          <h3 className="text-lg font-semibold text-tracer-green mb-2 text-center">Important Information</h3>
          <ul className="text-gray-200 space-y-1 text-sm text-center">
            <li>• Make sure you have your login credentials ready</li>
            <li>• Keep your session secure and don't share your access</li>
            <li>• Contact support if you need assistance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Utility: line-clamp fallback if Tailwind plugin is not available
const clampClass = 'overflow-hidden text-ellipsis whitespace-normal';

interface SortableVendorCardProps {
  vendor: VendorTemplate;
  index: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onShow: (vendor: VendorTemplate) => void;
  id: UniqueIdentifier;
}

function SortableVendorCard({ vendor, index, onEdit, onDelete, onShow, id }: SortableVendorCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const value = localStorage.getItem("auth_user");
  const parsedUser = value ? JSON.parse(value) : null;
  const roleId = parsedUser.role_id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    background: 'white',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`border pt-10 rounded-lg bg-white hover:shadow-md transition-shadow relative flex flex-col justify-between h-auto min-h-[160px] w-full min-w-0 p-4 ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="absolute top-2 right-2 flex items-center space-x-2">
        {(roleId === 1 || roleId === 2) && (
          <button
            className="text-blue-500 hover:text-blue-700"
            title="Edit Vendor"
            onClick={() => onEdit(vendor.id)}
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}

        <a
          href={vendor.login_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:text-green-800"
          title="Open Login URL"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onShow(vendor);
          }}
        >
          <ExternalLink className="h-4 w-4" />
        </a>

        {(roleId === 1 || roleId === 2) && (

          <button
            className="text-red-500 hover:text-red-700"
            title="Delete Vendor"
            onClick={() => onDelete(vendor.id)}
          >
            <Trash2 className="h-4 w-4" />
          </button>

        )}
      </div>
      <div className="flex items-start space-x-4 mb-4">
        {vendor.logo_url ? (
          <img
            src={`${import.meta.env.VITE_IMAGE_URL}${vendor.logo_url}`}
            alt={vendor.vendor_name}
            className="h-12 w-12 object-contain flex-shrink-0"
          />
        ) : (
          <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-gray-400 text-lg">
              {vendor.vendor_name.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 mb-2">
            {vendor.vendor_name}
          </h3>
          <p
            className="text-sm text-gray-500"
            title={vendor.description || "No description available"}
          >
            {vendor.description || "No description available"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Logins() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {
      processors: true,
      gateways: false,
      hardware: false,
    }
  );
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [vendorCards, setVendorCards] = useState<VendorCard[]>([]);
  const [vendors, setVendors] = useState<Record<string, VendorTemplate[]>>({
    processors: [],
    gateways: [],
    hardware: [],
  });
  const [adminVendors, setAdminVendors] = useState<
    Record<string, VendorTemplate[]>
  >({
    processors: [],
    gateways: [],
    hardware: [],
  });
  const fileInputs = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editVendorId, setEditVendorId] = useState<number | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<VendorTemplate | null>(null);

  const parsedUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const role_id = parsedUser.role_id;

  const categories = [
    { id: "gateways", name: "Gateways", icon: Router },
    { id: "hardware", name: "Hardware/Equipment", icon: HardDrive },
    // { id: "internal", name: "Internal", icon: Shield }, // <- updated
    // { id: "processors", name: "Processors", icon: CreditCard },
  ];

  // Conditionally add "internal"
  if (role_id == 1 || role_id == 2) {
    categories.push({ id: "internal", name: "Internal", icon: Shield });
  }

  // Add remaining item
  categories.push({ id: "processors", name: "Processors", icon: CreditCard });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    // Fetch vendors for each category
    categories.forEach((category) => {
      fetchVendors(category.id);
      fetchAdminVendors(category.id);
    });
    console.log("hello test");
  }, []);

  const fetchVendors = async (vendorType: string) => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("auth_token");
      if (!accessToken) {
        throw new Error("Authentication token not found. Please login again.");
      }
      const parsedUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
      // const role_id =parsedUser?.role_id;
      const body: any = {};
      if (parsedUser?.role_id !== 2) {
        body.user_id = parsedUser.id;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/vendor/get-all-vendors-list`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const responseData = await response.json();
      console.log("Vendor response:", responseData);

      if (responseData.status === "success") {
        // Sort vendors by card_order
        const vendorsByType = responseData.data;
        const sortedVendors = {
          processors: (vendorsByType.processors || []).sort((a: any, b: any) => 
            (a.card_order ?? Infinity) - (b.card_order ?? Infinity)
          ),
          gateways: (vendorsByType.gateways || []).sort((a: any, b: any) => 
            (a.card_order ?? Infinity) - (b.card_order ?? Infinity)
          ),
          hardware: (vendorsByType.hardware || []).sort((a: any, b: any) => 
            (a.card_order ?? Infinity) - (b.card_order ?? Infinity)
          ),
          internal: (vendorsByType.internal || []).sort((a: any, b: any) => 
            (a.card_order ?? Infinity) - (b.card_order ?? Infinity)
          ),
        };

        // Update the vendors state with the sorted data
        setVendors(sortedVendors);
      }
    } catch (error) {
      console.error(`Error fetching ${vendorType} vendors:`, error);
      toast.error(`Failed to fetch ${vendorType} vendors`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminVendors = async (vendorType: string) => {
    try {
      const vendorTypeData = {
        vendor_type: vendorType,
      };

      const accessToken = localStorage.getItem("auth_token");
      if (!accessToken) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/vendor/get-admin-vendor`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(vendorTypeData),
        }
      );
      const responseData = await response.json();
      if (responseData.status === "success") {
        setAdminVendors((prev) => ({
          ...prev,
          [vendorType]: responseData.data,
        }));
      }
    } catch (error) {
      console.error(`Error fetching admin ${vendorType} vendors:`, error);
    }
  };

  const fetchVendorTemplate = async (
    vendorName: string,
    vendorType: string
  ) => {
    try {
      const showVendorTemplateData = {
        vendor_name: vendorName,
        vendor_type: vendorType,
        user_id: 2,
      };

      const accessToken = localStorage.getItem("auth_token");
      if (!accessToken) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/vendor/show-vendor-template`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(showVendorTemplateData),
        }
      );

      const responseData = await response.json();
      console.log("Duplicate form response:", responseData);

      if (responseData.status === "success") {
        console.log(responseData.data, "responseData.data");
        return responseData.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching vendor template:", error);
      return null;
    }
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const filterItems = (items: VendorTemplate[]) => {
    if (!searchQuery.trim()) return items;

    return items.filter((item) =>
      item.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const openAddVendorModal = (category: string) => {
    setSelectedCategory(category);
    setVendorCards([
      {
        vendor_name: "",
        vendor_email: "",
        vendor_phone: "",
        logo_url: null,
        logoFile: null,
        login_url: "",
        rep_name: "",
        rep_email: "",
        rep_phone: "",
        notes: "",
        support_info: "",
        description: "",
        vendor_type: category,
        role_id: "",
      },
    ]);
    setShowAddVendorModal(true);
  };

  const handleCardChange = (idx: number, field: string, value: any) => {
    setVendorCards((cards) =>
      cards.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };

  const handleLogoUpload = (idx: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;  
      if (typeof result === "string") {
        setVendorCards((cards) =>
          cards.map((c, i) =>
            i === idx ? { ...c, logo_url: result, logoFile: file } : c
          )
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const addVendorCard = () => {
    setVendorCards((cards) => [
      ...cards,
      {
        vendor_name: "",
        vendor_email: "",
        vendor_phone: "",
        logo_url: null,
        logoFile: null,
        login_url: "",
        rep_name: "",
        rep_email: "",
        rep_phone: "",
        notes: "",
        support_info: "",
        description: "",
        vendor_type: selectedCategory,
        role_id: "",
      },
    ]);
  };

  const removeVendorCard = (idx: number) => {
    setVendorCards((cards) => cards.filter((_, i) => i !== idx));
  };

  const handleVendorSelect = async (idx: number, vendorName: string) => {
    if (vendorName === "Other") {
      // Reset the card to empty state
      setVendorCards((cards) =>
        cards.map((c, i) =>
          i === idx
            ? {
              vendor_name: "",
              vendor_email: "",
              vendor_phone: "",
              logo_url: null,
              logoFile: null,
              login_url: "",
              rep_name: "",
              rep_email: "",
              rep_phone: "",
              notes: "",
              support_info: "",
              description: "",
              vendor_type: selectedCategory,
              role_id: "",
            }
            : c
        )
      );
      return;
    }

    // Fetch template for selected vendor
    const template = await fetchVendorTemplate(vendorName, selectedCategory);

    if (template) {
      setVendorCards((cards) =>
        cards.map((c, i) => {
          if (i === idx) {
            let user_role = template.vendor_user?.role_id
              ? String(template.vendor_user.role_id)
              : "";

            return {
              ...c,
              vendor_name: template?.vendor_name || "",
              vendor_email: template?.vendor_email || "",
              vendor_phone: template?.vendor_phone || "",
              logo_url: template?.logo_url
                ? `${import.meta.env.VITE_IMAGE_URL}${template.logo_url}`
                : null,
              logoFile: null,
              login_url: template?.login_url || "",
              rep_name: template?.rep_name || "",
              rep_email: template?.rep_email || "",
              rep_phone: template?.rep_phone || "",
              notes: template?.notes || "",
              support_info: template?.support_info || "",
              description: template?.description || "",
              vendor_type: selectedCategory,
              role_id: user_role,
            };
          }

          return c;
        })
      );
    }
  };

  const handleSubmit = async () => {
    try {
      const parsedUser = JSON.parse(localStorage.getItem("auth_user") || "{}");

      const formData = new FormData();
      const vendorsData = vendorCards.map((card, index) => {
        const vendorData = {
          user_id: String(parsedUser.id),
          vendor_type: card.vendor_type,
          vendor_name: card.vendor_name,
          logo_url: card.logo_url,
          vendor_email: card.vendor_email,
          vendor_phone: card.vendor_phone,
          login_url: card.login_url,
          support_info: card.support_info,
          notes: card.notes,
          rep_name: card.rep_name,
          rep_email: card.rep_email,
          rep_phone: card.rep_phone,
          description: card.description,
        };

        if (card.logoFile) {
          formData.append(`vendors[${index}][logo_url]`, card.logoFile);
        }

        return vendorData;
      });

      const accessToken = localStorage.getItem("auth_token");
      formData.append("vendors", JSON.stringify(vendorsData));

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/vendor/create-vendor-template`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log("data", data);

      if (response.ok && data?.status === "success") {
        toast.success("Vendor template saved successfully.");
        setShowAddVendorModal(false);
        categories.forEach((category) => fetchVendors(category.id));
      } else {
        const errorMessage = data?.message || "Something went wrong.";
        const errorDetails = Array.isArray(data?.errors)
          ? data.errors.join("\n")
          : "";
        toast.error(`${errorDetails}`);
      }
    } catch (error: any) {
      console.error("Error creating vendors:", error);

      if (error?.response?.json) {
        try {
          const errorData = await error.response.json();
          const message = errorData?.message || "Error creating vendors.";
          const details = Array.isArray(errorData?.errors)
            ? errorData.errors.join("\n")
            : "";
          toast.error(`${details}`);
          return;
        } catch { }
      }

      toast.error("Error creating vendors.");
    }
  };

  const handleDeleteVendor = async (vendorId: number) => {
    if (!window.confirm("Are you sure you want to delete this vendor? This action cannot be undone.")) return;
    try {
      const accessToken = localStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendor/delete-vendor`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: vendorId }),
      });
      const data = await response.json();
      if (data.status === "success") {
        toast.success("Vendor deleted successfully");
        categories.forEach((category) => fetchVendors(category.id));
      } else {
        toast.error(data.message || "Failed to delete vendor");
      }
    } catch (err) {
      toast.error("Error deleting vendor");
    }
  };

  const handleDndKitDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find which category this drag happened in
    let draggedCategory: string | null = null;
    for (const cat of categoryIds) {
      if (vendors[cat].some((v) => v.id === active.id)) {
        draggedCategory = cat;
        break;
      }
    }
    if (!draggedCategory) return;

    const items = vendors[draggedCategory];
    const oldIndex = items.findIndex((v) => v.id === active.id);
    const newIndex = items.findIndex((v) => v.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    setVendors((prev) => ({ ...prev, [draggedCategory!]: newItems }));

    // Save order to API
    try {
      const accessToken = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/vendor/update-card-order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vendor_ids: newItems.map((v) => v.id),
          }),
        }
      );
      const data = await response.json();
      if (data.status !== "success") {
        toast.error("Failed to save card order");
      }
    } catch (error) {
      toast.error("Failed to save card order");
    }
  };

  console.log('items',categories);
  console.log('vendors222',vendors);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Header */}
      <div className="mb-8 bg-tracer-green rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-10 w-10 text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white">Login Portal</h1>
              <p className="text-white/80 mt-1">
                Access all your processor, gateway, and vendor logins in one
                place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search logins..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDndKitDragEnd}>
        <div className="space-y-4">
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            const items = filterItems(vendors[category.id] || []);
            const isOpen = openCategories[category.id];
            return (
              <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between">
                  <button
                    className="flex items-center space-x-3 text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <CategoryIcon className="h-6 w-6 text-gray-400" />
                    <span className="text-lg font-medium text-gray-900">
                      {category.name}
                      <span className="ml-2 text-sm text-gray-500">
                        ({items.length})
                      </span>
                    </span>
                  </button>

                  {(role_id === 1 || role_id === 2) && (
                  <button
                    onClick={() => openAddVendorModal(category.id)}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-tracer-green hover:bg-tracer-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tracer-green disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      `Add ${category.name}`
                    )}
                  </button>
                  )}
                </div>
                {isOpen && (
                  <div className="border-t border-gray-200">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Loading vendors...
                      </div>
                    ) : items.length > 0 ? (
                      <SortableContext items={items.map((v) => v.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                          {items.map((vendor, index) => (
                            <SortableVendorCard
                              key={vendor.id}
                              vendor={vendor}
                              index={index}
                              id={vendor.id}
                              onEdit={setEditVendorId}
                              onDelete={handleDeleteVendor}
                              onShow={setSelectedVendor}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No vendors found in this category. Add a new vendor to get started.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DndContext>

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-gray-900">
                Add {selectedCategory}
              </h2>
              <button
                onClick={() => setShowAddVendorModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={addVendorCard}
                className="px-2 py-1 text-xs font-medium text-white bg-tracer-green border border-transparent rounded hover:bg-tracer-blue"
              >
                + Add Card
              </button>
              <span className="text-xs text-gray-500">
                You can add multiple cards at once
              </span>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {vendorCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded p-3 shadow flex flex-col gap-2 relative"
                >
                  {vendorCards.length > 1 && (
                    <button
                      onClick={() => removeVendorCard(idx)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      title="Remove Card"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <div className="flex gap-2 items-center">
                    <label className="block text-xs font-medium text-gray-700 w-24">
                      Select Vendor
                    </label>
                    <select
                      className="block w-48 rounded border-gray-300 text-xs py-1 px-2"
                      value={card.vendor_name}
                      onChange={(e) => handleVendorSelect(idx, e.target.value)}
                    >
                      <option value="">Select Vendor</option>
                      {adminVendors[selectedCategory]?.map((v) => (
                        <option key={v.id} value={v.vendor_name}>
                          {v.vendor_name}
                        </option>
                      ))}
                      <option value="Other">Other (Custom)</option>
                    </select>
                  </div>

                  <div className="flex gap-2 items-center">
                    <label className="block text-xs font-medium text-gray-700 w-24">
                      Vendor Name
                    </label>
                    <input
                      type="text"
                      className="block w-48 rounded border-gray-300 text-xs py-1 px-2"
                      value={card.vendor_name}
                      onChange={(e) =>
                        handleCardChange(idx, "vendor_name", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex gap-2 items-center">
                    <label className="block text-xs font-medium text-gray-700 w-24">
                      Vendor Email
                    </label>
                    <input
                      type="text"
                      className="block w-48 rounded border-gray-300 text-xs py-1 px-2"
                      value={card.vendor_email}
                      onChange={(e) =>
                        handleCardChange(idx, "vendor_email", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex gap-2 items-center">
                    <label className="block text-xs font-medium text-gray-700 w-24">
                      Vendor Phone
                    </label>
                    <input
                      type="text"
                      className="block w-48 rounded border-gray-300 text-xs py-1 px-2"
                      value={card.vendor_phone}
                      onChange={(e) =>
                        handleCardChange(idx, "vendor_phone", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex gap-2 items-center">
                    <label className="block text-xs font-medium text-gray-700 w-24">
                      Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-32 text-xs"
                      ref={(el) => (fileInputs.current[idx] = el)}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0])
                          handleLogoUpload(idx, e.target.files[0]);
                      }}
                    />

                    {card.logo_url && (
                      <img
                        src={card.logo_url}
                        alt="Vendor Logo"
                        className="h-10 w-10 rounded-full object-cover mt-2"
                      />
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="block text-xs font-medium text-gray-700 w-24">
                      Login URL
                    </label>
                    <input
                      type="text"
                      className="block w-48 rounded border-gray-300 text-xs py-1 px-2"
                      value={card.login_url}
                      onChange={(e) =>
                        handleCardChange(idx, "login_url", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="block text-xs font-medium text-gray-700 w-24">
                      Contact name
                    </label>
                    <input
                      type="text"
                      className="block w-48 rounded border-gray-300 text-xs py-1 px-2"
                      value={card.rep_name}
                      onChange={(e) =>
                        handleCardChange(idx, "rep_name", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="block text-xs font-medium text-gray-700 w-24">
                      Contact email
                    </label>
                    <input
                      type="email"
                      className="block w-48 rounded border-gray-300 text-xs py-1 px-2"
                      value={card.rep_email}
                      onChange={(e) =>
                        handleCardChange(idx, "rep_email", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="block text-xs font-medium text-gray-700 w-24">
                      Rep Phone
                    </label>
                    <input
                      type="text"
                      className="block w-48 rounded border-gray-300 text-xs py-1 px-2"
                      value={card.rep_phone}
                      onChange={(e) =>
                        handleCardChange(idx, "rep_phone", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="block text-xs font-medium text-gray-700 w-24">
                      Support Info
                    </label>
                    <input
                      type="text"
                      className="block w-48 rounded border-gray-300 text-xs py-1 px-2"
                      value={card.support_info}
                      onChange={(e) =>
                        handleCardChange(idx, "support_info", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="block text-xs font-medium text-gray-700 w-24">
                      Notes
                    </label>
                    <textarea
                      className="block w-48 rounded border-gray-300 text-xs py-1 px-2"
                      rows={2}
                      value={card.notes}
                      onChange={(e) =>
                        handleCardChange(idx, "notes", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="block text-xs font-medium text-gray-700 w-24">
                      Description
                    </label>
                    <textarea
                      className="block w-48 rounded border-gray-300 text-xs py-1 px-2"
                      rows={2}
                      value={card.description}
                      onChange={(e) =>
                        handleCardChange(idx, "description", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowAddVendorModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tracer-green"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-tracer-green border border-transparent rounded-md hover:bg-tracer-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tracer-green"
              >
                Add Vendor(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {editVendorId && (
        <EditVendor
          vendorId={editVendorId}
          onClose={() => setEditVendorId(null)}
          onUpdated={() => {
            setEditVendorId(null);
            categories.forEach((category) => fetchVendors(category.id));
          }}
        />
      )}

      {/* Add modal component */}
      {selectedVendor && (
        <VendorLoginModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
        />
      )}
    </div>
  );
}
