import { Users, UserPlus, Briefcase, CheckSquare } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  let user = null;
  try {
    const userStr = localStorage.getItem("user");
    user = (userStr && userStr !== "undefined") ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Failed to parse user from localStorage:", e);
  }

  const stats = [
    { label: "Total Contacts", value: 0, icon: Users, tint: "#2563EB" },
    { label: "Total Leads", value: 0, icon: UserPlus, tint: "#22C55E" },
    { label: "Active Deals", value: 0, icon: Briefcase, tint: "#7C3AED" },
    { label: "Pending Tasks", value: 0, icon: CheckSquare, tint: "#EF4444" },
  ];

  return (
    <div className="flex bg-surface min-h-screen font-sans">

      <Sidebar />

      <div className="flex-1 ml-64 min-w-0">

        <Navbar />

        <main className="p-6 lg:p-8">

          <h1 className="text-2xl lg:text-[28px] font-extrabold text-text-primary mb-8 tracking-tight">
            Welcome back, {user?.name || "User"} 👋
          </h1>

          {/* Statistics */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="bg-card rounded-card shadow-card border border-border p-6 hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-text-secondary text-[13px] font-semibold">
                      {s.label}
                    </h3>
                    <div
                      className="w-10 h-10 rounded-[11px] flex items-center justify-center shrink-0"
                      style={{ background: `${s.tint}22` }}
                    >
                      <Icon size={19} style={{ color: s.tint }} />
                    </div>
                  </div>

                  <p className="text-4xl font-extrabold mt-4 text-text-primary tracking-tight">
                    {s.value}
                  </p>
                </div>
              );
            })}

          </div>

          {/* Quick Actions */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-card rounded-card shadow-card border border-border p-6">

              <h2 className="text-lg font-bold text-text-primary mb-5">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 gap-3.5">

                <button className="bg-primary hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-150 text-white rounded-control p-4 font-semibold text-[13.5px] shadow-sm hover:shadow-md">
                  Add Contact
                </button>

                <button className="bg-success hover:bg-green-600 hover:-translate-y-0.5 transition-all duration-150 text-white rounded-control p-4 font-semibold text-[13.5px] shadow-sm hover:shadow-md">
                  Add Lead
                </button>

                <button className="bg-[#7C3AED] hover:bg-[#6D28D9] hover:-translate-y-0.5 transition-all duration-150 text-white rounded-control p-4 font-semibold text-[13.5px] shadow-sm hover:shadow-md">
                  Create Deal
                </button>

                <button className="bg-warning hover:bg-amber-600 hover:-translate-y-0.5 transition-all duration-150 text-white rounded-control p-4 font-semibold text-[13.5px] shadow-sm hover:shadow-md">
                  Create Task
                </button>

              </div>

            </div>

            <div className="bg-card rounded-card shadow-card border border-border p-6">

              <h2 className="text-lg font-bold text-text-primary mb-5">
                Logged In User
              </h2>

              <div className="space-y-3.5 text-[13.8px]">

                <div className="flex justify-between border-b border-border-soft pb-3">
                  <span className="text-text-secondary font-medium">Name</span>
                  <span className="text-text-primary font-semibold">{user?.name || "—"}</span>
                </div>

                <div className="flex justify-between border-b border-border-soft pb-3">
                  <span className="text-text-secondary font-medium">Email</span>
                  <span className="text-text-primary font-semibold">{user?.email || "—"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">Role</span>
                  <span className="text-text-primary font-semibold">{user?.role || "—"}</span>
                </div>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}
