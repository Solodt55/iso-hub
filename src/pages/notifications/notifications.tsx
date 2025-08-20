import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, Trash } from 'lucide-react';
import { toast, Toaster } from "react-hot-toast";


export default function Notifications() {
  const [adminNotification, setAdminNotification] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const value = localStorage.getItem("auth_user");
      const parsedUser = value ? JSON.parse(value) : null;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notification/count/${parsedUser.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications..');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setAdminNotification(data.admin_notifications);
      } else {
        throw new Error(data.message || 'Failed to fetch');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);  
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notification/delete-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: String(id) })
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      toast.success('Notification deleted successfully');

      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const value = localStorage.getItem("auth_user");
      const parsedUser = value ? JSON.parse(value) : null;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notification/delete-all-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: parsedUser.id })
      });

      if (!response.ok) {
        throw new Error('Failed to delete all notifications');
      }

      await fetchNotifications();
      toast.success('All notifications deleted successfully');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Failed to delete all notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
    <Toaster position="top-right" reverseOrder={false} />
      <div className="user_cont my-10">
        <div className="flex justify-between items-center">
          <div className="w-full text-center bg-tracer-blue hover:bg-tracer-blue/90 text-white py-5 px-5 rounded font-medium uppercase transition duration-200">
            All Notifications
          </div>
          {adminNotification.length > 0 && (
            <button
              onClick={deleteAllNotifications}
              className="ml-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash className="h-5 w-5" />
              Delete All
            </button>
          )}
        </div>
      </div>

      <div className="user_data_wrap mt-10">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-tracer-green" />
          </div>
        ) : adminNotification.length > 0 ? (
          adminNotification.map((item: any, index: number) => (
            <div
              key={index}
              className="user_dataHead w-full px-5 py-4 rounded bg-gray-700 text-white flex justify-between items-center gap-4 mb-4"
            >
              <div className="w-[80%]">{item.message}</div>
              <button
                onClick={() => deleteNotification(item.id)}
                className="p-2 text-red-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="w-full text-center text-gray-400">No notifications available</div>
        )}
      </div>
    </>
  );
}
