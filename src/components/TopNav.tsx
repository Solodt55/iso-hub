import React, { useEffect, useState } from 'react';
import type { MenuItem } from '../types';
import { LogOut, Megaphone } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

export default function TopNav({
  items,
  onNavigate
}: {
  items: MenuItem[];
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const [userNotificationCount, setUserNotificationCount] = useState(0);

  const [isNotificationPath, setIsNotificationPath] = useState('');
  // Get role_id from auth_user in localStorage

  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.role_id === 1 || parsedUser?.role_id === 2) {
        setIsNotificationPath('/application_notifications');
      } else {
        setIsNotificationPath('/user-notification');
      }
    }
  }, []);


  const fetchNotifications = async () => {
    try {
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

      const data = await response.json();
      // console.log(data);
      // return false;

      if(data && data.message == 'Unauthorized'){
          handleLogout();
      }
      console.log('get data',data);
      if (data.status === 'success') {
        setUserNotificationCount(data.count);
        // console.log(data);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
      setTimeout(() => {
        handleLogout();
      }, 1000);
    }
  }

  const updateNotificationCount = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const value = localStorage.getItem("auth_user");
      const parsedUser = value ? JSON.parse(value) : null;

      if (!token || !parsedUser) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notification/remove-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({user_id: parsedUser.id})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update notification count');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setUserNotificationCount(0);
        // Navigate to the appropriate notification page
        navigate(isNotificationPath);
      } else {
        throw new Error(data.message || 'Failed to update notification count');
      }
    } catch (error) {
      console.error('Error updating notification count:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update notification count');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const isActive = (href: string) => {
    if (href.startsWith('http')) return false;
    return location.pathname === href;
  };

  return (
    <header className="bg-zinc-900 border-b border-tracer-green/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {items.map((item) => (
              item.href.startsWith('http') ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border-b-2 border-transparent hover:border-tracer-green text-sm font-medium text-gray-300 hover:text-tracer-green relative group"
                >
                  <item.icon className="h-5 w-5 mr-2 text-gray-400 group-hover:text-tracer-green" />
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-4 py-2 mx-1 border-b-2 text-sm font-medium relative group transition-all
                    ${isActive(item.href)
                      ? 'border-tracer-green text-tracer-green'
                      : 'border-transparent text-gray-300 hover:border-tracer-green hover:text-tracer-green'}`}
                >
                  <item.icon className={`h-5 w-5 mr-2 ${isActive(item.href) ? 'text-tracer-green' : 'text-gray-400 group-hover:text-tracer-green'}`} />
                  {item.name}
                </Link>
              )
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={updateNotificationCount}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-tracer-green/20"
            >
              <span className="sr-only">View notifications</span>
              <div className="relative">
                {userNotificationCount > 0 && (
                  <div className="absolute -top-2 -right-1 h-4 w-4 bg-tracer-green text-white text-[12px] font-bold flex items-center justify-center rounded-full">
                    {userNotificationCount}
                  </div>
                )}
                <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-tracer-green/20 text-white hover:text-tracer-green transition-colors"
            >
              <div className="relative">
                <LogOut className='w-[20px] h-[20px]' />
              </div>
            </button>
          </div>
        </div>
      </nav>

    </header>
  );
}