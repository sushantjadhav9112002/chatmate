import "./signinPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SigninPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      if (!data.token) {
        throw new Error("Authentication token missing in response");
      }

      localStorage.setItem("token", data.token);

      setMessage({ text: "Login successful! Redirecting...", type: "success" });

      // Redirect after a short delay
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
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
        <button type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
        {message.text && <p className={message.type}>{message.text}</p>}
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
