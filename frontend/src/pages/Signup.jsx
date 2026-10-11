import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthShell, ErrorNote, SlowNotice, useSlowNotice } from "../components/AuthShell";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const slow = useSlowNotice(loading);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don’t match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await API.post("/signup", { username, email, password });
      setSuccess("Account created. Taking you to log in…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") setError(detail);
      else if (Array.isArray(detail)) setError(detail[0].msg);
      else setError(err.response ? "Signup failed." : "Can’t reach the server. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="A keyboard-first place for your projects and tasks."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-ink underline decoration-accent underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <ErrorNote>{error}</ErrorNote>}
        {success && (
          <p role="status" className="mb-4 rounded-md border border-done/40 bg-done/10 px-3 py-2 text-sm text-done">
            {success}
          </p>
        )}
        <label className="block text-xs text-muted">
          Username
          <input required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="field mt-1" />
        </label>
        <label className="block text-xs text-muted">
          Email
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-1" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-muted">
            Password
            <input type="password" required maxLength={72} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field mt-1" />
          </label>
          <label className="block text-xs text-muted">
            Confirm
            <input type="password" required maxLength={72} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="field mt-1" />
          </label>
        </div>
        <button type="submit" disabled={loading || !!success} className="btn-primary mt-2 w-full">
          {loading ? "Creating account…" : "Create account"}
        </button>
        {slow && <SlowNotice />}
      </form>
    </AuthShell>
  );
}

export default Signup;
