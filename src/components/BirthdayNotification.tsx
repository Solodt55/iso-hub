import { useState } from "react";
import { X, Send, Loader2, Gift } from "lucide-react";
// import { toast } from "react-hot-toast";
import { toast, Toaster } from "react-hot-toast";

interface BirthdayNotificationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BirthdayNotification({ isOpen, onClose }: BirthdayNotificationProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please enter a birthday message");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/notification/send-to-all-users-mail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            msg: message.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send birthday notification");
      }

      const data = await response.json();
      console.log(data);
      
      if (data.status === "success") {
        toast.success(data.message || "Birthday notification sent successfully!");
        setMessage("");
        onClose();
      } else {
        throw new Error(data.message || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending birthday notification:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send birthday notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <Toaster position="top-right" reverseOrder={false} />
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-tracer-green/20 rounded-full">
            <Gift className="w-8 h-8 text-tracer-green" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Birthday Notification</h2>
            <p className="text-gray-400 text-sm">Send birthday wishes to all users</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-3 text-lg font-medium">
              Birthday Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your birthday message here... (e.g., Hello all, today is Mac trets birthday. Let's celebrate all!)"
              className="w-full h-32 px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              required
            />
            <p className="text-gray-400 text-sm mt-2">
              This message will be sent to all users via email notification.
            </p>
          </div>

          {/* <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-full">
                <Send className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <h4 className="text-yellow-400 font-medium mb-1">Notification Preview</h4>
                <p className="text-gray-300 text-sm">
                  {message || "Your birthday message will appear here..."}
                </p>
              </div>
            </div>
          </div> */}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setMessage("");
                onClose();
              }}
              className="flex-1 px-6 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="flex-1 px-6 py-3 rounded-lg bg-tracer-green hover:bg-tracer-green/90 disabled:bg-tracer-green/70 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
} 