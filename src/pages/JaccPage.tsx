import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useJacc } from '../context/JaccContext';

const JaccPage: React.FC = () => {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showLoader, setShowLoader] = useState(true);
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [jaccStatus, setJaccStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [iframeReady, setIframeReady] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'initializing' | 'connecting' | 'loading' | 'finalizing'>('initializing');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useAuth();
  const { isJaccInitialized, jaccUrl, initializeJacc } = useJacc();

  useEffect(() => {
    const setupJacc = async () => {
      if (!isJaccInitialized) {
        console.log('Initializing JACC...');
        setLoadingStage('initializing');
        await initializeJacc();
        setLoadingStage('connecting');
      } else {
        console.log('JACC already initialized, showing immediately');
        setIframeLoading(false);
        setLoadingStage('loading');
      }
    };

    setupJacc();
  }, [isJaccInitialized, initializeJacc]);

  // Set iframe source when JACC URL is available
  useEffect(() => {
    if (jaccUrl) {
      console.log('Setting iframe source to:', jaccUrl);
      setIframeSrc(jaccUrl);
      setLoadingStage('loading');
      
      // Test if JACC server is responding
      fetch(jaccUrl, { method: 'HEAD' })
        .then(() => {
          console.log('JACC server is responding');
          setJaccStatus('ready');
        })
        .catch((error) => {
          console.error('JACC server not responding:', error);
          setJaccStatus('error');
          setError('JACC server is not responding. Please check if JACC is running on port 5000.');
        });
    }
  }, [jaccUrl]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (iframeLoading) {
      const timeout = setTimeout(() => {
        console.log('Iframe loading timeout - hiding loader');
        setIframeLoading(false);
        setShowLoader(false);
      }, 20000); // 20 second timeout

      return () => clearTimeout(timeout);
    }
  }, [iframeLoading]);

  // Show loader until iframe is completely ready
  useEffect(() => {
    if (iframeLoading || !iframeReady) {
      setShowLoader(true);
    } else {
      setLoadingStage('finalizing');
      // Keep loader visible for a moment after iframe is fully ready
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 2000); // 2 seconds to ensure JACC is fully loaded
      return () => clearTimeout(timer);
    }
  }, [iframeLoading, iframeReady]);

  const getLoadingMessage = () => {
    switch (loadingStage) {
      case 'initializing':
        return 'Initializing JACC...';
      case 'connecting':
        return 'Connecting to JACC...';
      case 'loading':
        return 'Loading JACC Application...';
      case 'finalizing':
        return 'Finalizing JACC setup...';
      default:
        return 'Loading JACC Application...';
    }
  };

  if (!isJaccInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg mb-2">Initializing JACC...</p>
          <p className="text-gray-400 text-sm">Please wait while we connect to JACC</p>
        </div>
      </div>
    );
  }

  if (jaccStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-white mb-4">{error}</p>
          <p className="text-gray-400 text-sm mb-4">Make sure JACC server is running on port 5000</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-white mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="h-screen relative">
        {iframeSrc && (
          <>
            {/* Persistent iframe that stays loaded */}
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="w-full h-full border-0"
              title="JACC Application"
              allow="camera; microphone; geolocation"
              onLoad={() => {
                console.log('JACC iframe loaded successfully');
                setIframeLoading(false);
                
                // Wait a bit more to ensure JACC is fully rendered
                setTimeout(() => {
                  console.log('JACC iframe is now ready');
                  setIframeReady(true);
                }, 3000); // 3 seconds to ensure JACC is fully loaded
              }}
              onError={(e) => {
                console.error('JACC iframe error:', e);
                setIframeLoading(false);
                setError('Failed to load JACC application');
              }}
            />
            
            {/* Loader overlay for iframe - show until completely ready */}
            {showLoader && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                  <p className="text-white text-lg mb-2">{getLoadingMessage()}</p>
                  <p className="text-gray-400 text-sm">Please wait while JACC loads</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JaccPage; 