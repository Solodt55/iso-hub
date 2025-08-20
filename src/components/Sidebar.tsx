import {
  Shield,
  FileText,
  Settings,
  Cpu,
  User,
  LogOut,
  File,
  Bell,
  FormInput,
  X,
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  Gift
} from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import UserRep from "./UserRep";
import JACC from "./JACC";
import { useState, useEffect } from "react";

interface Category {
  name: string;
  icon: LucideIcon;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

export default function Sidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [encryptedKey, setEncryptedKey] = useState([]);

  const userData = localStorage.getItem("auth_user");
  const user = userData ? JSON.parse(userData) : {};
  const role_id = user.role_id;
  const email = user.email;

  const fetchEncryptedCredentials = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/encrypt/cred`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: email }), // Corrected line
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      console.log("data encryption", data.data.cipher);
      setEncryptedKey(data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchEncryptedCredentials();
  }, []);

  const newEncryptedKey = encryptedKey?.cipher || "";
  const iv = encryptedKey?.iv || "";

  const queryParams = `?secX=${encodeURIComponent(
    newEncryptedKey
  )}&secY=${encodeURIComponent(iv)}`;

  // const iv = encodeURIComponent("3jdtvH6MNd1V0PvakGs5VA==");
  const nonAdminCategories: Category[] = [
    // { name: 'Processors', icon: CreditCard },
    // { name: 'Gateways', icon: Router },
    // { name: 'Hardware/Equipment', icon: HardDrive },
    // { name: 'Internal', icon: Briefcase },
    // { name: 'Misc', icon: MoreHorizontal },
    {
      name: "ISO-Residuals",
      icon: FileText,
      href: `${import.meta.env.VITE_TRACER_URL}${queryParams}`,
      external: true,
    },
    {
      name: "ISO-AI",
      icon: Cpu,
      href: "https://02aa0592-869c-416a-869f-4cb3baafbabd-00-17ngv8bepjtga.picard.replit.dev",
      external: true,
    },
    { name: "Settings", icon: Settings },

    { name: "Resources", icon: BookOpen, href: "/applications" }
    
    // { name: 'Users', icon: User, href: '/users' },
    // { name: 'Residuals', icon: FileText, href: 'https://dev.tracerpos.com'  },
  ];

  const adminCategories = [
    ...nonAdminCategories,
    { name: "Admin", icon: User, href: "#" },
  ];

  const adminSubMenu = [
    { name: "Users", icon: User, path: "/admin" },
    // { name: 'Team Member', icon: User, path: '/teammember' },
    // { name: 'Vendor', icon: User, path: '/vendor' },
    // { name: 'Documents', icon: File, path: '/documents' },
    {
      name: "Documents",
      icon: File,
      path: "https://02aa0592-869c-416a-869f-4cb3baafbabd-00-17ngv8bepjtga.picard.replit.dev",
      external: true,
    },

    // { name: 'All Reps', icon: User, path: '/all_reps' },
    { name: "Notifications", icon: Bell, path: "/application_notifications" },
    { name: "Birthday Notification", icon: Gift, path: "/birthday-notify" },
    // { name: 'Forms', icon: FormInput, path: '/forms' },
  ];

  const userSubMenu = [
    { name: "User Notification", icon: Bell, path: "/user-notification" },
  ];

  // Get role_id from auth_user in localStorage
  const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
  // const isAdmin = authUser?.role_id === 1 || authUser?.role_id === 2 || authUser?.role_id === 3 || authUser?.role_id === 4;

  const isAdmin = authUser?.role_id === 1 || authUser?.role_id === 2;

  const isUser = authUser?.role_id === 5;
  const isUserNotification = ![1, 2].includes(authUser?.role_id ?? 0);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path: string) => {
    if (path === "/admin") {
      return (
        location.pathname === path ||
        adminSubMenu.some((item) => item.path === location.pathname)
      );
    }
    return location.pathname === path;
  };

  const categories = isAdmin ? adminCategories : nonAdminCategories;
  console.log(categories, "categories");

  return (
    <div
      className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 shadow-lg transform border-r border-tracer-green/20
      ${open ? "translate-x-0" : "-translate-x-full"}
      lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
    `}
    >
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-tracer-green/20">
          <div className="flex items-center justify-center space-x-2">
            {/* <Shield className="h-8 w-8 text-tracer-green" /> */}
            <div className="text-xl font-bold text-white tracking-tight">
              <img src="ISOHubLOGO.png" alt="" style={{ maxWidth: "71%" }} />
            </div>
          </div>
          <div className="mt-1 text-xs text-tracer-green/60">
            Secure Document Management
          </div>
        </div>

        <div className="px-4 py-6">
          <h2 className="text-lg font-semibold text-white">Categories</h2>
          <nav className="mt-6 navi-links">
            {categories.map((category) => (
              <div key={category.name} className="relative group">
                {category.external ? (
                  <a
                    href={category.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:text-tracer-green hover:border-l-4 hover:border-tracer-green relative"
                  >
                    <category.icon className="h-5 w-5 mr-3 text-gray-400 group-hover:text-tracer-green" />
                    {category.name}
                  </a>
                ) : category.onClick ? (
                  <button
                    onClick={category.onClick}
                    className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md hover:text-tracer-green relative transition-all
                      ${
                        isActive(
                          category.href || `/${category.name.toLowerCase()}`
                        )
                          ? "text-tracer-green border-l-4 border-tracer-green pl-2"
                          : "text-gray-300 hover:border-l-4 hover:border-tracer-green"
                      }`}
                  >
                    <category.icon
                      className={`h-5 w-5 mr-3 ${
                        isActive(
                          category.href || `/${category.name.toLowerCase()}`
                        )
                          ? "text-tracer-green"
                          : "text-gray-400 group-hover:text-tracer-green"
                      }`}
                    />
                    {category.name}
                  </button>
                ) : (
                  <Link
                    to={category.href || `/${category.name.toLowerCase()}`}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:text-tracer-green relative transition-all
                      ${
                        isActive(
                          category.href || `/${category.name.toLowerCase()}`
                        )
                          ? "text-tracer-green border-l-4 border-tracer-green pl-2"
                          : "text-gray-300 hover:border-l-4 hover:border-tracer-green"
                      }`}
                  >
                    <category.icon
                      className={`h-5 w-5 mr-3 ${
                        isActive(
                          category.href || `/${category.name.toLowerCase()}`
                        )
                          ? "text-tracer-green"
                          : "text-gray-400 group-hover:text-tracer-green"
                      }`}
                    />
                    {category.name}
                  </Link>
                )}

                {category.name === "Admin" && (
                  <div
                    className={`sub_menu absolute top-full left-0 w-full bg-zinc-800 px-2 z-[9] py-5 rounded 
                    ${
                      adminSubMenu.some(
                        (item) => location.pathname === item.path
                      )
                        ? "block"
                        : "hidden group-hover:block"
                    }`}
                  >
                    <ul>
                      {adminSubMenu.map((item) => (
                        <li
                          key={item.path}
                          className="text-white mt-2 first:mt-0"
                        >
                          {item.external ? (
                            <a
                              href={item.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex py-2 px-3 gap-2 items-center text-md rounded-md transition-all
            ${
              location.pathname === item.path
                ? "bg-black border-l-4 border-tracer-green text-tracer-green"
                : "bg-black hover:border-l-4 hover:border-tracer-green hover:text-tracer-green"
            }`}
                            >
                              <item.icon
                                className={`w-5 h-5 ${
                                  location.pathname === item.path
                                    ? "text-tracer-green"
                                    : ""
                                }`}
                              />
                              {item.name}
                            </a>
                          ) : (
                            <Link
                              to={item.path}
                              className={`flex py-2 px-3 gap-2 items-center text-md rounded-md transition-all
            ${
              location.pathname === item.path
                ? "bg-black border-l-4 border-tracer-green text-tracer-green"
                : "bg-black hover:border-l-4 hover:border-tracer-green hover:text-tracer-green"
            }`}
                            >
                              <item.icon
                                className={`w-5 h-5 ${
                                  location.pathname === item.path
                                    ? "text-tracer-green"
                                    : ""
                                }`}
                              />
                              {item.name}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {isUserNotification && (
              <div className="relative group mt-4">
                {/* {isUser && <UserRep />} */}
                {/* <div
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:text-tracer-green transition-all text-gray-300 hover:border-l-4 hover:border-tracer-green`}
                >
                  <Users className="h-5 w-5 mr-3 text-gray-400 group-hover:text-tracer-green" />
                  Users
                </div> */}

                {/* <div className="sub_menu w-full px-2 z-[9] py-1 rounded">
                  <ul>
                    {userSubMenu.map((item) => (
                      <li key={item.path} className="text-white mt-2 first:mt-0">
                        <Link
                          to={item.path}
                          className={`flex py-2 px-3 gap-2 items-center text-md rounded-md transition-all
                ${location.pathname === item.path
                              ? 'bg-black border-l-4 border-tracer-green text-tracer-green'
                              : 'bg-black hover:border-l-4 hover:border-tracer-green hover:text-tracer-green'}`}
                        >
                          <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-tracer-green' : ''}`} />
                          {item.name}
                        </Link>
                      </li>

                    ))}
                  </ul>
                </div> */}
              </div>
            )}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="absolute bottom-5 left-[50%] translate-x-[-50%] w-[90%] bg-tracer-green rounded py-3 font-semibold uppercase flex items-center justify-center hover:bg-tracer-green/90 gap-2 text-white"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
