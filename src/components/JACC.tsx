import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';

export default function JACC() {
  const [isMinimized, setIsMinimized] = useState(true);
  const [iframeUrl, setIframeUrl] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    const fetchUserAndHash = async () => {
      const userString = localStorage.getItem("auth_user");
      const user = userString ? JSON.parse(userString) : null;

      if (user && user.id) {
        try {
          const response = await fetch(`${API_BASE_URL}/chat-hash`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ user_id: user.id }),
          });

          const result = await response.json();

          if (response.ok && result.status === "success" && result.data) {
            const hash = result.data;
            setIframeUrl(`https://www.chatbase.co/chatbot-iframe/jA1Q6wb90V0__fc7bFS6t?userId=${user.id}&userHash=${hash}`);
          } else {
            console.error("Failed to fetch chat hash:", result.message);
          }
        } catch (error: any) {
          console.error("Error fetching user hash:", error.message);
        }
      }
    };

    fetchUserAndHash();
  }, [token]); // Run this when token changes (i.e. after login)

  // UI rendering
  if (isMinimized) {
    return (
      <button
        id="jacc-button"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 p-4 bg-zinc-900 rounded-full shadow-xl border border-tracer-green/20 text-tracer-green hover:bg-zinc-800 transition-colors duration-200"
      >
        {/* <Bot className="h-6 w-6" /> */}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-md bg-zinc-900 rounded-lg shadow-xl border border-tracer-green/20 flex flex-col" style={{ height: '600px' }}>
      <div className="p-4 border-b border-tracer-green/20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6 text-tracer-green" />
          <div>
            <h3 className="font-semibold text-white">JACC</h3>
            <p className="text-xs text-tracer-green/60">Your ISO Documentation Assistant</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-gray-400 hover:text-white transition-colors duration-200"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="flex-1">
        {iframeUrl && (
          <iframe
            key={iframeUrl} 
            src={iframeUrl}
            className="w-full h-full"
            style={{ border: 'none' }}
          ></iframe>
        )}
      </div>
    </div>
  );
}
