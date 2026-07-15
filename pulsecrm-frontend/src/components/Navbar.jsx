import { Bell, Search, UserCircle } from "lucide-react";

export default function Navbar() {
  let user = null;
  try {
    const userStr = localStorage.getItem("user");
    user = (userStr && userStr !== "undefined") ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Failed to parse user from localStorage:", e);
  }

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-20">

      <div className="relative w-96 max-w-full">

        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />

        <input
          type="text"
          placeholder="Search contacts, deals, tasks…"
          className="w-full bg-border-soft border border-transparent rounded-control py-2.5 pl-10 pr-4 text-[13.5px] outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
        />

      </div>

      <div className="flex items-center gap-5">

        <button className="relative w-9 h-9 rounded-control border border-border flex items-center justify-center text-text-primary hover:bg-border-soft transition-all duration-150">

          <Bell size={16} />

          <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
            3
          </span>

        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">

          <UserCircle
            size={38}
            className="text-primary"
            strokeWidth={1.5}
          />

          <div>

            <h3 className="font-semibold text-[13.8px] text-text-primary leading-tight">
              {user?.name || "User"}
            </h3>

            <p className="text-[12px] text-text-secondary leading-tight">
              {user?.role || "Member"}
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}
