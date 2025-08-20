import React, { useState } from 'react';
import { Plus, FileText, Settings, Trash2, Edit2, Eye, X } from 'lucide-react';

interface Form {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
}

export default function Forms() {
  const [forms, setForms] = useState<Form[]>([
    {
      id: '1',
      title: 'Vendor Registration Form',
      description: 'Form for new vendor registration',
      createdAt: '2024-03-20',
      updatedAt: '2024-03-20',
      status: 'published',
    },
    // Add more sample forms as needed
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
  });

  const handleCreateForm = (e: React.FormEvent) => {
    e.preventDefault();
    const form: Form = {
      id: Date.now().toString(),
      title: newForm.title,
      description: newForm.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };
    setForms([...forms, form]);
    setShowCreateForm(false);
    setNewForm({ title: '', description: '' });
  };

  const handleDeleteForm = (id: string) => {
    setForms(forms.filter(form => form.id !== id));
  };

  const getStatusColor = (status: Form['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/10 text-green-500';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'archived':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 bg-tracer-green rounded-lg p-6 shadow-lg">
        <div className="flex items-center space-x-3">
          <FileText className="h-10 w-10 text-white" />
          <div>
            <h1 className="text-3xl font-bold text-white">Forms</h1>
            <p className="text-white/80 mt-1">Manage your application forms</p>
          </div>
        </div>
      </div>

      {/* Create Form Section */}
      {showCreateForm && (
        <div className="mb-8 bg-zinc-900 p-6 rounded-lg border border-yellow-400/20">
          <h3 className="text-xl font-semibold text-white mb-4">Create New Form</h3>
          <form onSubmit={handleCreateForm}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Form Title</label>
                <input
                  type="text"
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                  rows={1}
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
              >
                Create Form
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div
            key={form.id}
            className="bg-zinc-900 p-6 rounded-lg border border-yellow-400/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-medium text-lg">{form.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{form.description}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(form.status)}`}
              >
                {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Last updated: {new Date(form.updatedAt).toLocaleDateString()}</span>
              <div className="flex space-x-2">
                <button
                  className="p-1 hover:text-white"
                  title="View Form"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  className="p-1 hover:text-white"
                  title="Edit Form"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  className="p-1 hover:text-red-500"
                  title="Delete Form"
                  onClick={() => handleDeleteForm(form.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 