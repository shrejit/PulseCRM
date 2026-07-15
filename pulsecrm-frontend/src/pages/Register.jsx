import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, User, Mail, Building, Lock, AlertCircle } from "lucide-react";
import api from "../api/api";
import { loginSuccess } from "../features/auth/authSlice";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
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

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
      });

      localStorage.setItem("accessToken", data.data.accessToken);

      if (data.data.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data.data.user)
      );

      dispatch(
        loginSuccess({
          user: data.data.user,
          accessToken: data.data.accessToken,
        })
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputWrap = "relative";
  const inputBase =
    "w-full border border-border rounded-control pl-10 pr-4 py-3 text-[13.8px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-150";
  const iconBase = "absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary";
  const labelBase = "block mb-1.5 text-[12.5px] font-semibold text-text-secondary";

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface font-sans px-4 py-10">
      <div className="w-full max-w-lg bg-card rounded-card shadow-card-md p-8 sm:p-10 border border-border">

        <div className="text-center mb-8">
          <div className="w-9 h-9 rounded-[10px] bg-primary text-white flex items-center justify-center font-extrabold text-base mx-auto mb-4">
            P
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Create your account
          </h1>

          <p className="text-text-secondary mt-1.5 text-[13.5px]">
            Start managing your CRM today.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-danger-light text-red-700 rounded-control p-3 mb-5 text-[12.8px]">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelBase}>Full Name</label>
              <div className={inputWrap}>
                <User size={15} className={iconBase} />
                <input
                  className={inputBase}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelBase}>Company Name</label>
              <div className={inputWrap}>
                <Building size={15} className={iconBase} />
                <input
                  className={inputBase}
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Acme Inc."
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className={labelBase}>Email</label>
            <div className={inputWrap}>
              <Mail size={15} className={iconBase} />
              <input
                type="email"
                className={inputBase}
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={labelBase}>Password</label>

              <div className={inputWrap}>
                <Lock size={15} className={iconBase} />

                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border border-border rounded-control pl-10 pr-11 py-3 text-[13.8px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-150"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors duration-150"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>

              </div>

            </div>

            <div>
              <label className={labelBase}>Confirm Password</label>
              <div className={inputWrap}>
                <Lock size={15} className={iconBase} />
                <input
                  type={showPassword ? "text" : "password"}
                  className={inputBase}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white py-3 rounded-control font-bold text-[14px] shadow-[0_4px_14px_rgba(37,99,235,0.32)] hover:-translate-y-px transition-all duration-150"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>

        <div className="mt-6 text-center text-[13px] text-text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Log in
          </Link>
        </div>

      </div>
    </div>
  );
}
