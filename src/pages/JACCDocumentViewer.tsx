import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Eye, ArrowLeft, FileText, Calendar, User, File } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  description?: string;
  userId: string;
}

const JACCDocumentViewer: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [documentData, setDocumentData] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;

      try {
        const authToken = localStorage.getItem('auth_token');
        const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        
        // First try to authenticate with JACC
        const authResponse = await fetch('http://localhost:5000/api/auth/simple-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            username: authUser.email || 'test@example.com',
            password: '12345678' // Default password for ISO-Hub users
          })
        });

        // Now fetch the document
        const response = await fetch(`http://localhost:5000/api/documents/${documentId}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const doc = await response.json();
          setDocumentData(doc);
        } else {
          console.error('Document fetch failed:', response.status, response.statusText);
          setError('Document not found or access denied');
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  const handleDownload = async () => {
    if (!documentData) return;

    try {
      const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      
      // First authenticate with JACC
      await fetch('http://localhost:5000/api/auth/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: authUser.email || 'test@example.com',
          password: '12345678'
        })
      });

      // Now trigger download
      const downloadUrl = `http://localhost:5000/api/documents/${documentId}/download`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = documentData.originalName || documentData.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading document:', err);
    }
  };

  const handleView = async () => {
    if (!documentData) return;

    try {
      const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      
      // First authenticate with JACC
      await fetch('http://localhost:5000/api/auth/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: authUser.email || 'test@example.com',
          password: '12345678'
        })
      });

      // Now open document view
      const viewUrl = `http://localhost:5000/api/documents/${documentId}/view`;
      window.open(viewUrl, '_blank');
    } catch (err) {
      console.error('Error viewing document:', err);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !documentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <div className="text-gray-600 mb-4">{error || 'Document not found'}</div>
          <button 
            onClick={() => navigate('/jacc')}
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition-colors"
          >
            Back to JACC
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/jacc')}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{getFileIcon(documentData.mimeType)}</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{documentData.name}</h1>
                  <p className="text-sm text-gray-500">JACC Document Viewer</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleView}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">File Name</p>
                    <p className="text-sm text-gray-600">{documentData.originalName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">File Type</p>
                    <p className="text-sm text-gray-600">{documentData.mimeType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Uploaded</p>
                    <p className="text-sm text-gray-600">
                      {new Date(documentData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">File Size</p>
                    <p className="text-sm text-gray-600">{formatFileSize(documentData.size)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Preview</h2>
              
              {/* Document Preview Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="text-8xl mb-6">{getFileIcon(documentData.mimeType)}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {documentData.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  Click "View" to open this document in a new tab
                </p>
                {documentData.description && (
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    {documentData.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={handleView}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="h-5 w-5" />
                  <span>View Document</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JACCDocumentViewer; 