import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./dashboardlayout.css";
import Chatlist from "../../../components1/ChatList/ChatList";

const DashboardLayout = () => {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No auth token found! Redirecting...");
          navigate("/sign-in");
          return;
        }

        // ✅ Check if token is expired
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        if (Date.now() >= tokenPayload.exp * 1000) {
          console.error("Token expired! Logging out...");
          localStorage.removeItem("token");
          navigate("/sign-in");
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Unauthorized - Status Code: ${response.status}`);
        }

        const data = await response.json();
        if (!data.userId) throw new Error("Invalid user data received");

        setUserId(data.userId);
      } catch (error) {
        console.error("Authentication error:", error.message);
        setTimeout(() => navigate("/sign-in"), 100);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="dashboardlayout">
      <div className="menu">
        <Chatlist />
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
