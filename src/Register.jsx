import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./styles/auth.css";
import { authApi } from "./api";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.register(name, email, password);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Register gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen bg-[#D4ECD4] flex items-center justify-center">
      
      {/* CARD */}
      <div className="bg-[#a8c89a] w-[450px] rounded-[20px] px-8 py-7 shadow-lg">
        
        {/* TITLE */}
        <h1 className="text-white text-2xl font-semibold text-center mb-8">
          Create your Account
        </h1>

        {/* NAME */}
        <form onSubmit={handleRegister}>

        {error && (
          <p className="text-red-100 bg-red-500/40 rounded-xl px-4 py-2 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <div className="mb-5">
          <label className="text-white text-sm block mb-2">
            Name
          </label>

          <input
            type="text"
            placeholder="Enter your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-transparent border border-white text-white placeholder-white outline-none"
          />
        </div>

        {/* EMAIL */}
        <div className="mb-5">
          <label className="text-white text-sm block mb-2">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-transparent border border-white text-white placeholder-white outline-none"
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-8">
          <label className="text-white text-sm block mb-2">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-transparent border border-white text-white placeholder-white outline-none"
          />
        </div>

        {/* BUTTON */}
        
        <button type="submit" disabled={loading} className="w-full bg-[#5f8f87] hover:bg-[#537d76] text-white py-3 rounded-xl font-medium transition disabled:opacity-60">
          {loading ? "Memproses..." : "Create Account"}
        </button>
        </form>

        {/* LOGIN */}
        <p className="text-center text-white text-sm mt-4">
          Already have a account?{" "}
          <span 
           onClick={() => navigate("/Login")}
            className="text-[#4e6f6a] cursor-pointer font-medium"
          >
            Log in
          </span>
        </p>
</div>
    </div>
  );
}
export default Register;