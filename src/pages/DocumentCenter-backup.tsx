import React, { useState } from 'react';
import { Search, ChevronDown, CreditCard, Router, HardDrive, FileText, Plus, Briefcase, MoreHorizontal } from 'lucide-react';
import type { Vendor } from '../types';
import AddVendorWizard from '../components/AddVendorWizard';

// Sample data - in a real app, this would come from an API/database
const vendors: Vendor[] = [
  {
    id: 'firstdata',
    name: 'First Data',
    logo: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=128&h=128&fit=crop',
    category: 'processor',
    description: 'Leading global payment technology solutions company',
    website: 'https://firstdata.com',
    documents: [
      {
        id: '1',
        title: 'Merchant Agreement',
        description: 'Standard merchant processing agreement',
        url: '#',
        type: 'pdf',
        uploadedAt: '2024-03-10',
        category: 'agreement'
      },
      {
        id: '2',
        title: 'Integration Guide',
        description: 'Technical integration documentation',
        url: '#',
        type: 'pdf',
        uploadedAt: '2024-03-09',
        category: 'guide'
      }
    ],
    contacts: [
      {
        name: 'John Smith',
        role: 'Account Manager',
        email: 'john.smith@firstdata.com',
        phone: '(555) 123-4567'
      }
    ],
    supportUrl: 'https://firstdata.com/support',
    trainingUrl: 'https://firstdata.com/training'
  },
  {
    id: 'tsys',
    name: 'TSYS',
    logo: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=128&h=128&fit=crop',
    category: 'processor',
    description: 'Global payment solutions provider',
    website: 'https://tsys.com',
    documents: [
      {
        id: '1',
        title: 'API Documentation',
        description: 'Complete API integration guide',
        url: '#',
        type: 'pdf',
        uploadedAt: '2024-03-10',
        category: 'guide'
      }
    ],
    contacts: [
      {
        name: 'Jane Doe',
        role: 'Technical Support',
        email: 'jane.doe@tsys.com',
        phone: '(555) 987-6543'
      }
    ],
    supportUrl: 'https://tsys.com/support',
    trainingUrl: 'https://tsys.com/training'
  },
  {
    id: 'authorize-net',
    name: 'Authorize.net',
    logo: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=128&h=128&fit=crop',
    category: 'gateway',
    description: 'Payment gateway service provider',
    website: 'https://authorize.net',
    documents: [
      {
        id: '1',
        title: 'Integration Guide',
        description: 'Technical integration documentation',
        url: '#',
        type: 'pdf',
        uploadedAt: '2024-03-10',
        category: 'guide'
      }
    ],
    contacts: [
      {
        name: 'Support Team',
        role: 'Technical Support',
        email: 'support@authorize.net',
        phone: '(555) 111-2222'
      }
    ],
    supportUrl: 'https://authorize.net/support',
    trainingUrl: 'https://authorize.net/training'
  },
  {
    id: 'clover',
    name: 'Clover',
    logo: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=128&h=128&fit=crop',
    category: 'hardware',
    description: 'POS system and payment hardware provider',
    website: 'https://clover.com',
    documents: [
      {
        id: '1',
        title: 'Hardware Guide',
        description: 'Hardware setup and maintenance',
        url: '#',
        type: 'pdf',
        uploadedAt: '2024-03-10',
        category: 'guide'
      }
    ],
    contacts: [
      {
        name: 'Support Team',
        role: 'Technical Support',
        email: 'support@clover.com',
        phone: '(555) 333-4444'
      }
    ],
    supportUrl: 'https://clover.com/support',
    trainingUrl: 'https://clover.com/training'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    logo: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=128&h=128&fit=crop',
    category: 'internal',
    description: 'CRM platform for sales and customer management',
    website: 'https://salesforce.com',
    documents: [
      {
        id: '1',
        title: 'User Guide',
        description: 'Salesforce user documentation',
        url: '#',
        type: 'pdf',
        uploadedAt: '2024-03-10',
        category: 'guide'
      }
    ],
    contacts: [
      {
        name: 'Admin Team',
        role: 'Internal Admin',
        email: 'admin@company.com',
        phone: '(555) 555-5555'
      }
    ],
    supportUrl: 'https://salesforce.com/support',
    trainingUrl: 'https://salesforce.com/training'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    logo: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=128&h=128&fit=crop',
    category: 'misc',
    description: 'Accounting software for small businesses',
    website: 'https://quickbooks.intuit.com',
    documents: [
      {
        id: '1',
        title: 'Accounting Guide',
        description: 'QuickBooks accounting procedures',
        url: '#',
        type: 'pdf',
        uploadedAt: '2024-03-10',
        category: 'guide'
      }
    ],
    contacts: [
      {
        name: 'Support Team',
        role: 'Technical Support',
        email: 'support@quickbooks.com',
        phone: '(555) 666-7777'
      }
    ],
    supportUrl: 'https://quickbooks.intuit.com/support',
    trainingUrl: 'https://quickbooks.intuit.com/training'
  }
];

const categories = [
  { id: 'processors', name: 'Processors', icon: CreditCard },
  { id: 'gateways', name: 'Gateways', icon: Router },
  { id: 'hardware', name: 'Hardware/Equipment', icon: HardDrive },
  { id: 'internal', name: 'Internal', icon: Briefcase },
  { id: 'misc', name: 'Misc', icon: MoreHorizontal }
];

export default function DocumentCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    processors: true,
    gateways: false,
    hardware: false,
    internal: false,
    misc: false
  });
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [vendorsList, setVendorsList] = useState<Vendor[]>(vendors);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const filterVendors = (category: string) => {
    const categoryMapping: Record<string, string> = {
      'processors': 'processor',
      'gateways': 'gateway',
      'hardware': 'hardware',
      'internal': 'internal',
      'misc': 'misc'
    };
    
    return vendorsList.filter(vendor => 
      vendor.category === categoryMapping[category] && 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleNavigateToVendor = (e: React.MouseEvent<HTMLAnchorElement>, vendorId: string) => {
    e.preventDefault();
    window.history.pushState({}, '', `/documents/${vendorId}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleAddVendor = () => {
    setShowAddVendorModal(true);
  };

  const handleVendorAdded = (vendorId: string) => {
    // In a real app, we would fetch the updated vendor list from the database
    // For demo purposes, we'll just close the modal
    setShowAddVendorModal(false);
    
    // Navigate to the new vendor page
    window.history.pushState({}, '', `/documents/${vendorId}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 bg-tracer-green rounded-lg p-6 shadow-lg">
        <div className="flex items-center space-x-3">
          <FileText className="h-10 w-10 text-white" />
          <div>
            <h1 className="text-3xl font-bold text-white">Document Center</h1>
            <p className="text-white/80 mt-1">Access and manage your documents</p>
          </div>
        </div>
      </div>

      {/* Search and Add Vendor */}
      <div className="mb-8 flex items-center space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search vendors or documents..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={handleAddVendor}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Vendor
        </button>
      </div>

      {/* Accordion Categories */}
      <div className="space-y-4">
        {categories.map((category) => {
          const CategoryIcon = category.icon;
          const items = filterVendors(category.id);
          const isOpen = openCategories[category.id];

          return (
            <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center space-x-3">
                  <CategoryIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-lg font-medium text-gray-900">
                    {category.name}
                    <span className="ml-2 text-sm text-gray-500">
                      ({items.length})
                    </span>
                  </span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="relative group bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img
                              src={vendor.logo}
                              alt={vendor.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {vendor.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {vendor.documents.length} documents
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <a
                              href={`/documents/${vendor.id}`}
                              onClick={(e) => handleNavigateToVendor(e, vendor.id)}
                              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <FileText className="h-5 w-5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No vendors found in this category. Add a new vendor to get started.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <AddVendorWizard 
          onClose={() => setShowAddVendorModal(false)}
          onVendorAdded={handleVendorAdded}
        />
      )}
    </div>
  );
}