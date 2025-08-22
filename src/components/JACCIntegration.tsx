import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface JACCIntegrationProps {
  // Add any props if needed
}

const JACCIntegration: React.FC<JACCIntegrationProps> = () => {
  const [isLoading, setIsLoading] = useState(false); // Start with false to load immediately
  const [error, setError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const location = useLocation();
  
  // Extract the JACC path from the current location
  const jaccPath = location.pathname.replace('/jacc', '') || '/';
  
  // Get ISO-Hub auth token
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  
  // Quick timeout to handle any loading issues
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && !iframeLoaded) {
        console.log('JACC iframe loading timeout - forcing display');
        setIsLoading(false);
      }
    }, 2000); // Reduced to 2 seconds for faster loading
    
    return () => clearTimeout(timeout);
  }, [isLoading, iframeLoaded]);

  // Hide loader immediately when iframe loads - no delay
  useEffect(() => {
    if (iframeLoaded) {
      // No delay - hide immediately
      setIsLoading(false);
    }
  }, [iframeLoaded]);

  // Listen for ISO-Hub logout events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' && !e.newValue) {
        // ISO-Hub logged out, logout from JACC
        console.log('🔄 ISO-Hub logged out, logging out from JACC...');
        fetch(`${import.meta.env.VITE_JACC_URL || 'http://localhost:5000'}/api/logout`, {
          method: 'GET',
          credentials: 'include',
        }).then(() => {
          console.log('✅ JACC logout successful');
        }).catch((error) => {
          console.log('⚠️ JACC logout error:', error);
        });
      }
    };

    // Listen for storage changes (logout events)
    window.addEventListener('storage', handleStorageChange);

    // Also check for logout on focus (in case storage event doesn't fire)
    const handleFocus = () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('🔄 No auth token found, logging out from JACC...');
        fetch(`${import.meta.env.VITE_JACC_URL || 'http://localhost:5000'}/api/logout`, {
          method: 'GET',
          credentials: 'include',
        }).then(() => {
          console.log('✅ JACC logout successful');
        }).catch((error) => {
          console.log('⚠️ JACC logout error:', error);
        });
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Handle messages from JACC iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'JACC_NAVIGATE') {
        // Navigate to the specified URL
        window.location.href = event.data.url;
      } else if (event.data.type === 'JACC_DOWNLOAD') {
        // Handle document download
        const { documentId, documentName } = event.data;
        const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        
        try {
          // Now trigger download
          const downloadUrl = `http://localhost:5000/api/documents/${documentId}/download`;
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = documentName;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          console.error('Error downloading document:', err);
        }
      } else if (event.data.type === 'JACC_READY') {
        console.log('JACC is ready to receive auth data:', event.data);
        // JACC is ready, send auth data immediately
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          try {
            const authUserData = localStorage.getItem('auth_user');
            const authUser = authUserData ? JSON.parse(authUserData) : null;
            
            console.log('Sending auth data to ready JACC:', {
              type: 'ISO_HUB_AUTH',
              user: authUser
            });
            
            iframe.contentWindow.postMessage({
              type: 'ISO_HUB_AUTH',
              token: localStorage.getItem('auth_token'),
              user: authUser
            }, import.meta.env.VITE_JACC_URL || 'http://localhost:5000');
          } catch (err) {
            console.error('Could not send auth data to ready JACC:', err);
          }
        }
      } else if (event.data.type === 'JACC_AUTH_RECEIVED') {
        console.log('JACC confirmed auth data received:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
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
  
  // Construct the JACC URL - use JACC development server directly
  const jaccUrl = `${import.meta.env.VITE_JACC_URL || 'http://localhost:5000'}${jaccPath}`;
  
  return (
    <div className="w-full h-screen bg-black">
      <iframe
        src={jaccUrl}
        className="w-full h-full border-0 jacc-iframe"
        title="JACC AI Assistant"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
        loading="eager" // Load immediately
        onLoad={() => {
          console.log('JACC iframe loaded successfully');
          setIframeLoaded(true);
          
          // Function to send auth data to JACC iframe
          const sendAuthData = () => {
            const iframe = document.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
              try {
                // Get ISO-Hub user data
                const authUserData = localStorage.getItem('auth_user');
                const authUser = authUserData ? JSON.parse(authUserData) : null;
                
                console.log('ISO-Hub localStorage auth_user:', authUserData);
                console.log('ISO-Hub parsed auth user:', authUser);
                console.log('ISO-Hub user keys:', authUser ? Object.keys(authUser) : 'No user');
                console.log('ISO-Hub user first_name:', authUser?.first_name);
                console.log('ISO-Hub user last_name:', authUser?.last_name);
                console.log('ISO-Hub user email:', authUser?.email);
                
                console.log('ISO-Hub sending auth data to JACC:', {
                  type: 'ISO_HUB_AUTH',
                  token: localStorage.getItem('auth_token'),
                  user: authUser
                });
                
                // Send ISO-Hub auth data to JACC iframe
                iframe.contentWindow.postMessage({
                  type: 'ISO_HUB_AUTH',
                  token: localStorage.getItem('auth_token'),
                  user: authUser
                }, import.meta.env.VITE_JACC_URL || 'http://localhost:5000');
                
                console.log('ISO-Hub auth data sent to JACC iframe');
              } catch (err) {
                console.error('Could not send auth data to JACC iframe:', err);
              }
            } else {
              console.error('JACC iframe or contentWindow not available');
            }
          };
          
          // Send immediately
          sendAuthData();
          
          // Retry after a short delay to ensure JACC is ready
          setTimeout(sendAuthData, 1000);
          setTimeout(sendAuthData, 2000);
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

export default JACCIntegration; 