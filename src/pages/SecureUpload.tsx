import React, { useState, useRef, useEffect } from 'react';
import { File as FileIcon, Shield, Clock, Upload, AlertCircle, Calendar } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import { useSearchParams, useParams } from "react-router-dom";

const imageTypes = ['jpg', 'jpeg', 'png', 'gif'];

const SecureUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isValidLink, setIsValidLink] = useState<boolean>(false);
  const [isCheckingLink, setIsCheckingLink] = useState<boolean>(true);
  const [signatureDate, setSignatureDate] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<SignaturePad>(null);
  const [searchParams] = useSearchParams();
  const [personalGuarantee, setPersonalGuarantee] = useState("no");
  const [signatureType, setSignatureType] = useState("e-signature");
  const data = searchParams.get('data');
  const [hoveredFileIdx, setHoveredFileIdx] = useState<number | null>(null);
  const { user_id, user_data } = useParams<{ user_id: string,user_data: string }>();

  const user_new_data  = user_id+"&"+user_data;
  useEffect(() => {
    const checkUniqueString = async () => {
      // if (!data) {
      //   setIsValidLink(false);
      //   setIsCheckingLink(false);
      //   return;
      // }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/file/check-unique-string/${user_new_data}`);

        const responseData = await response.json();

        if (response.ok) {
          setIsValidLink(true);
          setSignatureType(responseData.data.clear_signature);
          setPersonalGuarantee(responseData.data.personal_guarantee_required);
        } else {
          setIsValidLink(false);
          toast.error('Invalid or expired upload link');
        }
      } catch (error) {
        console.error('Error checking link:', error);
        setIsValidLink(false);
        toast.error('Failed to validate upload link');
      } finally {
        setIsCheckingLink(false);
      }
    };

    checkUniqueString();
  }, [user_data]);

  const handleBrowseClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const files = Array.from(droppedFiles);
      setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
    }
  };

  const handleRemoveFile = (index: number): void => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleUpload = async (): Promise<void> => {
    // if (!data) {
    //   toast.error('Invalid upload link');
    //   return;
    // }

    if (uploadedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    const signaturePad = signatureRef.current;

    if(signatureType === "e-signature"){
      if (!signatureDate) {
        toast.error('Please select a date');
        return;
      }
      if (!signaturePad || signaturePad.isEmpty()) {
        toast.error('Please provide a signature');
        return;
      }
    }

    // try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('unique_string', user_new_data);
      
      if (signatureType === "e-signature") {
        formData.append('signature_date', signatureDate);
        formData.append('signature', signaturePad.toDataURL());
      } else {
        formData.append('signature_date', '');
        formData.append('signature', '');
      }
      // Append each file to FormData
      uploadedFiles.forEach((file) => {
        formData.append('files[]', file);
      });

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload-files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const responseData = await response.json();
      console.log('Upload response:', responseData);

      toast.success(responseData.message || 'Files uploaded successfully!');
      setUploadedFiles([]);
      setSignatureDate('');
      clearSignature();
    // } catch (error) {
    //   console.error('Upload error:', error);
    //   toast.error('Failed to upload files');
    // } finally {
    //   setIsUploading(false);
    // }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isCheckingLink) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="bg-zinc-900 rounded-lg shadow-xl p-8 border border-yellow-400/20 text-center max-w-md w-full">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">
            Validating upload link...
          </p>
        </div>
      </div>
    );
  }

  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="bg-zinc-900 rounded-lg shadow-xl p-8 border border-yellow-400/20 text-center max-w-md w-full">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">
            Invalid Upload Link
          </h1>
          <p className="text-gray-400 mb-6">
            This upload link is invalid or has expired. Please contact your administrator to request a new secure upload link.
          </p>
          <div className="flex items-center justify-center gap-2 text-yellow-400/60 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secure Document Exchange</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="bg-zinc-900 border-b border-yellow-400/20 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-yellow-400" />
            <div className="text-xl font-bold text-white tracking-tight">
              ISO<span className="text-yellow-400">Hub</span>
            </div>
          </div>
          <div className="text-sm text-yellow-400/60">
            Secure Document Exchange
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-zinc-900 rounded-lg shadow-xl p-8 border border-yellow-400/20">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-4">
                Upload Your Documents
              </h1>
              <p className="text-gray-400 mb-6">
                Your documents will be securely transferred and automatically deleted after 180 days.
              </p>
            </div>

            {/* Security Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <Shield className="w-5 h-5 text-yellow-400" />
                <span>End-to-end encrypted file transfer</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span>Files automatically deleted after 180 days</span>
              </div>
            </div>

            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-yellow-400/20 rounded-lg p-8 text-center mb-6"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <FileIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">
                Drag and drop your files here, or click to select files
              </p>
              <button
                onClick={handleBrowseClick}
                className="bg-tracer-green rounded py-2 px-6 font-semibold text-white hover:bg-tracer-green/90 transition-colors"
              >
                Select Files
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>

            {/* Selected Files */}
            {uploadedFiles.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Selected Files</h2>
                <div className="space-y-2 relative">
                  {uploadedFiles.map((file, idx) => {
                    const ext = file.name.split('.').pop()?.toLowerCase() || '';
                    const isImage = imageTypes.includes(ext);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-zinc-800 rounded p-3 relative"
                        onMouseEnter={() => setHoveredFileIdx(idx)}
                        onMouseLeave={() => setHoveredFileIdx(null)}
                      >
                        <div className="flex items-center gap-3">
                          <FileIcon className="w-5 h-5 text-yellow-400" />
                          <span className="text-white">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-400">
                            {formatFileSize(file.size)}
                          </span>
                          <button
                            onClick={() => handleRemoveFile(idx)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                        {/* Preview Popup */}
                        {hoveredFileIdx === idx && (
                          <div className="absolute left-0 top-full mt-2 z-50 bg-zinc-900 border border-yellow-400/40 rounded shadow-lg p-2 min-w-[120px] max-w-[220px] flex flex-col items-center">
                            {isImage ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="max-w-[200px] max-h-[160px] rounded shadow border border-zinc-700"
                                style={{ objectFit: 'contain' }}
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center py-4">
                                <FileIcon className="w-10 h-10 text-yellow-400 mb-2" />
                                <span className="text-xs text-gray-400">Preview not available</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Signature Section - Conditional Arrangement */}
            {signatureType === "clearance" ? (
              <div className="border border-yellow-400/20 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-yellow-400 mb-4">Clearance Signature</h3>
                <p className="text-gray-400">Please submit a physical clearance signature or upload scanned copy.</p>
              </div>
            ) : (
              <div className="border border-yellow-400/20 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-yellow-400 mb-4">E-signature</h3>

                {/* Date Field */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="signature_date" className="block text-sm font-medium text-gray-300 mb-1">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="signature_date"
                        name="signature_date"
                        value={signatureDate}
                        onChange={(e) => setSignatureDate(e.target.value)}
                        className="block w-full rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:ring-yellow-400 px-3 py-1.5 text-sm"
                        required
                      />
                      <Calendar className="absolute right-2 top-1.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Signature Field */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Signature</label>
                  <div className="border border-gray-600 rounded bg-white">
                    <SignaturePad
                      ref={signatureRef}
                      canvasProps={{ className: 'w-full h-28' }}
                    />
                  </div>
                </div>

                {/* Clear Signature Button */}
                <div className="flex items-center justify-end md:justify-start mt-2">
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs text-gray-300 hover:text-white flex items-center space-x-1 bg-gray-700 px-2 py-1 rounded"
                  >
                    <span>Clear Signature</span>
                  </button>
                </div>
              </div>
            )}

            {/* Personal Guarantee Section */}
            {/* <div className="mb-6 border border-yellow-400/20 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-yellow-400 mb-2">Is Personal Guarantee Required?</h3>
              <div className="flex gap-6 text-sm text-gray-300">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="personalGuarantee"
                    value="yes"
                    checked
                    className="accent-yellow-400"
                  />
                 <span>{personalGuarantee.charAt(0).toUpperCase() + personalGuarantee.slice(1)}</span>

                </label>
              </div>
            </div> */}



            {/* Upload Button */}
            {uploadedFiles.length > 0 && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-tracer-green rounded py-2.5 font-semibold text-white hover:bg-tracer-green/90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Files</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecureUpload; 