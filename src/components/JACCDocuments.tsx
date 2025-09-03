import React, { useState, useEffect, useRef } from 'react';

const JACCDocuments: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false to load immediately
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Get ISO-Hub auth token
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  
  // Load the JACC documents page directly
  const jaccDocumentsUrl = `${import.meta.env.VITE_JACC_URL || 'http://localhost:5000'}/documents`;
  
  // Quick timeout to handle any loading issues
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('JACC loading timeout - forcing display');
        setIsLoading(false);
      }
    }, 3000); // Reduced to 3 seconds
    
    return () => clearTimeout(timeout);
  }, [isLoading]);
  
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-xl mb-4">⚠️ Connection Error</div>
          <div className="text-gray-300 mb-4">{error}</div>
          <div className="text-sm text-gray-500">
            To use JACC features, please ensure the JACC server is running on port 5000.
            <br />
            Run: <code className="bg-gray-800 px-2 py-1 rounded">npm run start-dev</code> in the iso-hub folder
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }
  
  // Show minimal loading screen only briefly
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <span className="text-yellow-400 text-xl">Loading JACC...</span>
          <p className="text-gray-400 text-sm mt-2">Please wait while we connect to JACC</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-screen">
      <iframe
        ref={iframeRef}
        src={jaccDocumentsUrl}
        className="w-full h-full border-0 jacc-iframe"
        title="JACC Document Center"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation allow-presentation"
        loading="eager" // Load immediately
        onLoad={() => {
          console.log('JACC documents iframe loaded successfully');
          setIsLoading(false);
          
          // Send authentication data to JACC iframe
          if (iframeRef.current && iframeRef.current.contentWindow) {
            try {
              // Send ISO-Hub auth data to JACC iframe
              iframeRef.current.contentWindow.postMessage({
                type: 'ISO_HUB_AUTH',
                token: localStorage.getItem('auth_token'),
                user: authUser
              }, import.meta.env.VITE_JACC_URL || 'http://localhost:5000');
            } catch (err) {
              console.log('Could not send auth data to JACC documents iframe');
            }
          }
        }}
        onError={() => {
          console.error('JACC iframe failed to load');
          setError('Failed to load JACC interface');
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default JACCDocuments; 