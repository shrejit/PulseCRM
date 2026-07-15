import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import api from "../api/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
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
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post(
        `/api/auth/reset-password/${token}`,
        {
          password: formData.password,
        }
      );

      setSuccess(
        data.message ||
          "Password reset successful. Redirecting..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface font-sans px-4">

      <div className="w-full max-w-md bg-card rounded-card shadow-card-md p-8 sm:p-10 border border-border">

        <div className="text-center mb-8">

          <div className="w-9 h-9 rounded-[10px] bg-primary text-white flex items-center justify-center font-extrabold text-base mx-auto mb-4">
            P
          </div>

          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Reset password
          </h1>

          <p className="text-text-secondary mt-1.5 text-[13.5px]">
            Create a new password for your account.
          </p>

        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 bg-danger-light text-red-700 p-3 rounded-control text-[12.8px]">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2 bg-success-light text-green-700 p-3 rounded-control text-[12.8px]">
            <CheckCircle2 size={15} className="shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="mb-4">

            <label className="block mb-1.5 text-[12.5px] font-semibold text-text-secondary">
              New password
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
              />

              <button
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors duration-150"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

            </div>

          </div>

          <div className="mb-6">

            <label className="block mb-1.5 text-[12.5px] font-semibold text-text-secondary">
              Confirm password
            </label>

            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full border border-border rounded-control pl-10 pr-4 py-3 text-[13.8px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-150"
              />
            </div>

          </div>

          <button
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white py-3 rounded-control font-bold text-[14px] shadow-[0_4px_14px_rgba(37,99,235,0.32)] hover:-translate-y-px transition-all duration-150"
          >
            {loading
              ? "Updating password..."
              : "Reset password"}
          </button>

        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-[13px] text-primary font-semibold hover:underline"
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>

      </div>

    </div>
  );
}
