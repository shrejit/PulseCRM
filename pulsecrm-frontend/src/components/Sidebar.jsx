import {
  LayoutDashboard,
  Users,
  UserPlus,
  Briefcase,
  CheckSquare,
  Building2,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";

export default function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    dispatch(logout());

    navigate("/login");
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "Contacts",
      icon: Users,
      path: "/contacts",
    },
    {
      title: "Leads",
      icon: UserPlus,
      path: "/leads",
    },
    {
      title: "Deals",
      icon: Briefcase,
      path: "/deals",
    },
    {
      title: "Tasks",
      icon: CheckSquare,
      path: "/tasks",
    },
    {
      title: "Company",
      icon: Building2,
      path: "/company",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <aside className="w-64 bg-sidebar text-white h-screen fixed left-0 top-0 flex flex-col z-30">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 rounded-[9px] bg-primary flex items-center justify-center font-extrabold text-[15px]">
          P
        </div>
        <h1 className="text-[16.5px] font-bold tracking-tight">
          PulseCRM
        </h1>
      </div>

      <nav className="mt-3 px-3 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] mb-1 text-[13.8px] font-medium border-l-[3px] transition-all duration-150 ${
                  isActive
                    ? "bg-primary/15 text-white font-semibold border-primary"
                    : "text-slate-400 border-transparent hover:bg-sidebar-hover hover:text-white"
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-danger hover:bg-red-600 text-white py-2.5 rounded-[10px] text-[13.5px] font-semibold shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-150"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
