import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import api from "../api/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.post(
        "/api/auth/forgot-password",
        {
          email,
        }
      );

      setSuccess(
        data.message ||
          "Password reset link has been sent to your email."
      );

      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send reset email."
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
            Forgot password
          </h1>

          <p className="text-text-secondary mt-1.5 text-[13.5px]">
            Enter your email to receive a password reset link.
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

          <div className="mb-6">

            <label className="block mb-1.5 text-[12.5px] font-semibold text-text-secondary">
              Email address
            </label>

            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                className="w-full border border-border rounded-control pl-10 pr-4 py-3 text-[13.8px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-150"
                placeholder="you@company.com"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white py-3 rounded-control font-bold text-[14px] shadow-[0_4px_14px_rgba(37,99,235,0.32)] hover:-translate-y-px transition-all duration-150"
          >
            {loading
              ? "Sending..."
              : "Send reset link"}
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
