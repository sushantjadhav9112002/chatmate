import "./signinPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SigninPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      if (!data.token) {
        throw new Error("Authentication token missing in response");
      }

      localStorage.setItem("authToken", data.token);

      // Ensure navigation happens after storage update
      setTimeout(() => navigate("/dashboard"), 100);
    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message);
    }
  };

  return (
    
    <div className="signinpage">
      
      <form onSubmit={handleSignIn}>
        <h2>Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
        {error && <p className="error">{error}</p>}
        <p>
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/sign-up")}
            className="signup-link"
          >
            Create one
          </span>
        </p>
      </form>
    </div>
  );
};

export default SigninPage;