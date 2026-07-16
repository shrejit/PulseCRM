import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Sparkles, Check } from "lucide-react";
import api from "../api/api";
import { loginStart, loginSuccess, loginFailure } from "../features/auth/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch(loginStart());
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/api/auth/login", formData);

      localStorage.setItem("accessToken", data.data.accessToken);

      if (data.data.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }

      localStorage.setItem("user", JSON.stringify(data.data.user));

      dispatch(
        loginSuccess({
          user: data.data.user,
          accessToken: data.data.accessToken,
        })
      );

      navigate("/dashboard");
    } catch (err) {
      dispatch(loginFailure());

      setError(
        err.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface font-sans">

      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 text-white relative overflow-hidden bg-gradient-to-br from-sidebar via-[#182543] to-primary-dark">

        <div className="absolute w-[420px] h-[420px] rounded-full bg-primary/30 blur-3xl -top-36 -right-36" />

        <div className="flex items-center gap-2.5 z-10">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-primary flex items-center justify-center font-extrabold text-[16px]">
            P
          </div>
          <span className="font-bold text-lg tracking-tight">PulseCRM</span>
        </div>

        <div className="z-10 max-w-md">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs font-semibold mb-5">
            <Sparkles size={13} /> Built for revenue teams
          </div>
          <h1 className="text-[34px] font-extrabold leading-tight mb-3.5 tracking-tight">
            Every deal, every contact, one pipeline that never loses the thread.
          </h1>
          <p className="text-[14.5px] text-slate-300 leading-relaxed">
            Track leads, manage deals, and close faster with a CRM built for how sales teams actually work.
          </p>

          <div className="flex flex-col gap-3 mt-8">
            {[
              "Real-time pipeline visibility across your team",
              "Automated follow-ups and task reminders",
              "Reports that update themselves",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-[13.3px] text-slate-200">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-success" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="z-10 text-xs text-slate-400">© 2026 PulseCRM. All rights reserved.</div>
      </div>

      {/* Right — form panel */}
      <div className="w-full lg:w-[460px] shrink-0 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
              Welcome back
            </h1>

            <p className="text-text-secondary mt-1.5 text-[13.5px]">
              Sign in to your PulseCRM workspace.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-control bg-danger-light text-red-700 text-[12.8px] p-3">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="mb-4">
              <label className="block mb-1.5 text-[12.5px] font-semibold text-text-secondary">
                Email
              </label>

              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-border rounded-control pl-10 pr-4 py-3 text-[13.8px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-150"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="mb-2">

              <label className="block mb-1.5 text-[12.5px] font-semibold text-text-secondary">
                Password
              </label>

              <div className="relative">

                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-border rounded-control pl-10 pr-11 py-3 text-[13.8px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-150"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors duration-150"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>

              </div>

            </div>

            <div className="flex justify-end mb-6 mt-2">
              <Link
                to="/forgot-password"
                className="text-[12.8px] text-primary font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 transition-all duration-150 text-white py-3 rounded-control font-bold text-[14px] shadow-[0_4px_14px_rgba(37,99,235,0.32)] hover:-translate-y-px"
            >
              {loading ? "Signing in..." : "Log in"}
            </button>

          </form>

          <div className="mt-6 text-center text-[13px] text-text-secondary">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Register
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
