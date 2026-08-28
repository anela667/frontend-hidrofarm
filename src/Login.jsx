import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./styles/auth.css";
import { authApi, saveSession } from "./api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.login(email, password);
      saveSession(data.token, data.data);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Login gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D4ECD4] flex items-center justify-center">
      
      {/* CARD */}
      <div className="bg-[#a8c89a] w-[450px] rounded-[35px] px-8 py-10 shadow-lg">
        
        {/* TITLE */}
        <h1 className="text-white text-3xl font-semibold text-center mb-10">
          Login Your Account
        </h1>

        
        <form onSubmit={handleLogin}>

          {error && (
            <p className="text-red-100 bg-red-500/40 rounded-xl px-4 py-2 text-sm mb-4 text-center">
              {error}
            </p>
          )}

          <div className="mb-6">
            <label className="text-white text-sm block mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-transparent border border-white text-white placeholder-white outline-none"
            />
          </div>

          
          <div className="mb-10">
            <label className="text-white text-sm block mb-2">
              Password
            </label>

            <input
              type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-transparent border border-white text-white placeholder-white outline-none"
            />
          </div>

          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5f8f87] hover:bg-[#537d76] text-white py-3 rounded-2xl text-lg font-medium transition disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Login Account"}
          </button>
        </form>

        
        <p className="text-center text-white text-sm mt-6">
          Don't Have an account?{" "}
          
          <span
            onClick={() => navigate("/register")}
            className="text-[#4e6f6a] cursor-pointer font-medium"
          >
            Sign Up
          </span>
          </p>
      </div>
    </div>
  );
}

export default Login;
