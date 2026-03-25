import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";




function Signup() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  console.log(username, email, password, confirmPassword);

  const navigate = useNavigate();

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {

      setLoading(true);

      const response = await API.post("/signup", {
        username: username,
        email: email,
        password: password,
      })

      console.log("Signup success:", response.data);


      // Show success message and redirect to login after a short delay
      setSuccess("Account created successfully! Redirecting to login...");
      setError("");


      setLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 1500)
    }
    catch (error) {

      setLoading(false);

      if (error.response && error.response.data) {
        const data = error.response.data;

        if (typeof data.detail === "string") {
          setError(data.detail);
        } else if (Array.isArray(data.detail)) {
          setError(data.detail[0].msg);
        } else {
          setError("Signup failed");
        }
      } else {
        setError("Network error");
      }

      setSuccess(""); 
    }
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">

        <form onSubmit={handleSubmit}>

          <h2 className="text-2xl font-bold mb-6 text-center">
            Signup
          </h2>

          {/* Show error message */}
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {error}
            </p>
          )}

          {/* Show success message */}
          {success && (
            <p className="text-green-500 text-sm mb-4 text-center">
              {success}
            </p>
          )}

          <input
            type="text"
            placeholder="Username"
            value={username}
            className="w-full border p-2 rounded mb-4"
            onChange={(e) => { setUsername(e.target.value) }}
          ></input>
          <input
            type="email"
            placeholder="Email"
            value={email}
            className="w-full border p-2 rounded mb-4"
            onChange={(e) => { setEmail(e.target.value) }}
          ></input>
          <input
            type="password"
            placeholder="Password"
            value={password}
            className="w-full border p-2 rounded mb-4"
            onChange={(e) => { setPassword(e.target.value) }}
          ></input>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            className="w-full border p-2 rounded mb-4"
            onChange={(e) => { setConfirmPassword(e.target.value) }}
          ></input>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >{loading ? "Loading..." : "Signup"}</button>
        </form>
      </div>

    </div>
  );

}

export default Signup;