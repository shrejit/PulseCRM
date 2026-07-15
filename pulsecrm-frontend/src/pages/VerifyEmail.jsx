import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import api from "../api/api";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data } = await api.get(
          `/api/auth/verify-email/${token}`
        );

        setSuccess(true);
        setMessage(
          data.message || "Email verified successfully."
        );

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setSuccess(false);
        setMessage(
          err.response?.data?.message ||
            "Email verification failed."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface font-sans px-4">
        <div className="w-full max-w-md bg-card rounded-card shadow-card-md p-10 text-center border border-border">
          <Loader2 size={32} className="mx-auto mb-5 text-primary animate-spin" />

          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
            Verifying email...
          </h2>

          <p className="mt-3 text-text-secondary text-[13.5px]">
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface font-sans px-4">

      <div className="w-full max-w-md bg-card rounded-card shadow-card-md p-8 sm:p-10 text-center border border-border">

        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${
            success ? "bg-success-light" : "bg-danger-light"
          }`}
        >
          {success ? (
            <CheckCircle2 size={28} className="text-success" />
          ) : (
            <XCircle size={28} className="text-danger" />
          )}
        </div>

        <h1
          className={`text-2xl font-extrabold tracking-tight ${
            success ? "text-green-600" : "text-danger"
          }`}
        >
          {success
            ? "Email verified"
            : "Verification failed"}
        </h1>

        <p className="text-text-secondary mt-3 text-[13.5px]">
          {message}
        </p>

        <div className="mt-8">

          <Link
            to="/login"
            className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-control font-bold text-[14px] shadow-[0_4px_14px_rgba(37,99,235,0.32)] hover:-translate-y-px transition-all duration-150"
          >
            Go to login
          </Link>

        </div>

      </div>

    </div>
  );
}
