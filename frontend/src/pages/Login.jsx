import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthShell, ErrorNote, SlowNotice, useSlowNotice } from "../components/AuthShell";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const slow = useSlowNotice(loading);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await API.post("/login", new URLSearchParams({ username: email, password }));
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);
      setError(err.response ? "That email and password don’t match." : "Can’t reach the server. Try again in a moment.");
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your workspace."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="text-ink underline decoration-accent underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <ErrorNote>{error}</ErrorNote>}
        <label className="block text-xs text-muted">
          Email
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-1" />
        </label>
        <label className="block text-xs text-muted">
          Password
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field mt-1" />
        </label>
        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
          {loading ? "Logging in…" : "Log in"}
        </button>
        {slow && <SlowNotice />}
      </form>
    </AuthShell>
  );
}

export default Login;
