import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Loader2, Check, AlertTriangle, Globe, Phone, Mail, User, Briefcase, Image } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { VendorFormData, VendorContact } from '../types';
import { supabase } from '../lib/supabase';

interface AddVendorWizardProps {
  onClose: () => void;
  onVendorAdded: (vendorId: string) => void;
}

export default function AddVendorWizard({ onClose, onVendorAdded }: AddVendorWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [websiteData, setWebsiteData] = useState<{
    logo?: string;
    contacts?: VendorContact[];
    description?: string;
  } | null>(null);
  const [isScrapingWebsite, setIsScrapingWebsite] = useState(false);

  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    category: 'processor',
    website: '',
    description: '',
    contacts: [{ name: '', role: '', email: '', phone: '' }],
    supportUrl: '',
    trainingUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (index: number, field: keyof VendorContact, value: string) => {
    const updatedContacts = [...formData.contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setFormData(prev => ({ ...prev, contacts: updatedContacts }));
  };

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', role: '', email: '', phone: '' }]
    }));
  };

  const removeContact = (index: number) => {
    if (formData.contacts.length > 1) {
      const updatedContacts = [...formData.contacts];
      updatedContacts.splice(index, 1);
      setFormData(prev => ({ ...prev, contacts: updatedContacts }));
    }
  };

  const fetchWebsiteData = async () => {
    if (!formData.website) {
      setError('Please enter a website URL');
      return;
    }

    setIsScrapingWebsite(true);
    setError(null);

    try {
      // In a real implementation, this would call a serverless function to scrape the website
      // For demo purposes, we'll simulate a response after a delay
      setTimeout(() => {
        // Simulate finding data from the website
        const mockData = {
          logo: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=128&h=128&fit=crop`,
          description: `${formData.name} is a leading provider of payment solutions and services.`,
          contacts: [
            {
              name: 'Support Team',
              role: 'Customer Support',
              email: `support@${formData.website.replace(/^https?:\/\//, '').replace(/www\./, '').split('/')[0]}`,
              phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
            }
          ]
        };

        setWebsiteData(mockData);
        
        // Pre-fill the form with the scraped data
        setFormData(prev => ({
          ...prev,
          description: mockData.description,
          logo: mockData.logo,
          contacts: mockData.contacts,
          supportUrl: `https://${formData.website.replace(/^https?:\/\//, '').replace(/www\./, '').split('/')[0]}/support`,
          trainingUrl: `https://${formData.website.replace(/^https?:\/\//, '').replace(/www\./, '').split('/')[0]}/training`
        }));
        
        setIsScrapingWebsite(false);
      }, 2000);
    } catch (err) {
      console.error('Error fetching website data:', err);
      setError('Failed to fetch website data. Please enter the information manually.');
      setIsScrapingWebsite(false);
    }
  };

  const validateStep = (currentStep: number) => {
    setError(null);
    
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Vendor name is required');
        return false;
      }
      if (!formData.website.trim()) {
        setError('Website URL is required');
        return false;
      }
      return true;
    }
    
    if (currentStep === 2) {
      if (!formData.description.trim()) {
        setError('Description is required');
        return false;
      }
      return true;
    }
    
    if (currentStep === 3) {
      const hasValidContact = formData.contacts.some(
        contact => contact.name.trim() && contact.email.trim()
      );
      if (!hasValidContact) {
        setError('At least one contact with name and email is required');
        return false;
      }
      return true;
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate a unique ID for the vendor
      const vendorId = formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + uuidv4().slice(0, 8);
      
      // In a real implementation, this would save to Supabase or another database
      // For demo purposes, we'll simulate a successful save
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
        
        // Call the onVendorAdded callback with the new vendor ID
        onVendorAdded(vendorId);
        
        // Close the modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }, 2000);
    } catch (err) {
      console.error('Error saving vendor:', err);
      setError('Failed to save vendor. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {step === 1 && 'Add New Vendor - Basic Information'}
            {step === 2 && 'Add New Vendor - Description & Logo'}
            {step === 3 && 'Add New Vendor - Contact Information'}
            {step === 4 && 'Add New Vendor - Review & Confirm'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= stepNumber
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
          <div className="mt-2 h-1 bg-gray-200 rounded-full">
            <div
              className="h-1 bg-green-600 rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 flex items-center">
            <Check className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>Vendor added successfully!</p>
          </div>
        )}

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., First Data, Authorize.net"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="processor">Processor</option>
                <option value="gateway">Gateway</option>
                <option value="hardware">Hardware/Equipment</option>
                <option value="internal">Internal</option>
                <option value="misc">Misc</option>
              </select>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website URL *
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://example.com"
                />
                <button
                  onClick={fetchWebsiteData}
                  disabled={isScrapingWebsite || !formData.website}
                  className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                  {isScrapingWebsite ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Globe className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Click the globe icon to automatically fetch vendor information from the website.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Description & Logo */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Brief description of the vendor and their services"
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <div className="flex items-start space-x-4">
                <input
                  type="text"
                  id="logo"
                  name="logo"
                  value={formData.logo || ''}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo && (
                  <div className="flex-shrink-0">
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      className="h-12 w-12 rounded-full object-cover border border-gray-300"
                    />
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Enter a URL for the vendor's logo or use the one we found from their website.
              </p>
            </div>

            <div>
              <label htmlFor="supportUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Support URL
              </label>
              <input
                type="text"
                id="supportUrl"
                name="supportUrl"
                value={formData.supportUrl || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com/support"
              />
            </div>

            <div>
              <label htmlFor="trainingUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Training URL
              </label>
              <input
                type="text"
                id="trainingUrl"
                name="trainingUrl"
                value={formData.trainingUrl || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com/training"
              />
            </div>
          </div>
        )}

        {/* Step 3: Contact Information */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
              <button
                onClick={addContact}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                Add Contact
              </button>
            </div>

            {formData.contacts.map((contact, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Contact #{index + 1}</h4>
                  {formData.contacts.length > 1 && (
                    <button
                      onClick={() => removeContact(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <div className="flex">
                      <div className="flex-shrink-0 inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="John Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <div className="flex">
                      <div className="flex-shrink-0 inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={contact.role}
                        onChange={(e) => handleContactChange(index, 'role', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Account Manager"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <div className="flex">
                      <div className="flex-shrink-0 inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <div className="flex">
                      <div className="flex-shrink-0 inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="(555) 555-5555"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Information</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">Basic Information</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-gray-900">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="text-gray-900 capitalize">{formData.category}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Website</p>
                      <p className="text-gray-900">{formData.website}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Description</h4>
                  <p className="mt-2 text-gray-900">{formData.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Contacts</h4>
                  <div className="mt-2 space-y-4">
                    {formData.contacts.map((contact, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="text-gray-900">{contact.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Role</p>
                            <p className="text-gray-900">{contact.role}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-gray-900">{contact.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-gray-900">{contact.phone}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
              disabled={loading}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
          )}
          
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="ml-auto px-4 py-2 bg-tracer-green text-white rounded-md hover:bg-tracer-green/90 focus:outline-none focus:ring-2 focus:ring-tracer-green flex items-center"
              disabled={loading}
            >
              Next
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="ml-auto px-4 py-2 bg-tracer-green text-white rounded-md hover:bg-tracer-green/90 focus:outline-none focus:ring-2 focus:ring-tracer-green flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Save Vendor
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}