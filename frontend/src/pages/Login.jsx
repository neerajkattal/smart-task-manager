import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // console.log(email, password);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post(
        "/login",
        new URLSearchParams({
          username: email,
          password: password,
        })
      );

      console.log(response.data);
      const token = response.data.access_token;

      localStorage.setItem("token", token);
      navigate("/dashboard");

    } catch (error) {
      alert("Invalid credentials");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <form onSubmit={handleSubmit}>

          <h2 className="text-2xl font-bold mb-6 text-center">
            Login
          </h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >Login</button>
        </form>
        <div className="flex flex-col items-center">
          <p className="mt-5">
            New here?
            <Link to="/signup" className="text-blue-500">  Click here to Signup!</Link>

          </p>
        </div>
      </div>
    </div>
  )

}

export default Login;