import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./rootLayout.css";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

const RootLayout = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <RootLayoutContent />
        </QueryClientProvider>
    );
};

const RootLayoutContent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient(); // ✅ Now inside QueryClientProvider
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("token")));

    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(Boolean(localStorage.getItem("token")));
        };

        // Listen for storage changes
        const handleStorageChange = () => checkAuth();
        window.addEventListener("storage", handleStorageChange);

        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    useEffect(() => {
        setIsAuthenticated(Boolean(localStorage.getItem("token")));

        // ✅ **Refetch all queries on page refresh**
        queryClient.refetchQueries(); 

    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        navigate("/sign-in");
    };

    return (
        <div className="rootLayout">
            <header>
                <Link to="/" className="logo">
                    <img src="/logo.png" alt="Logo" />
                    <span>Sushant's AI</span>
                </Link>
                <div className="user">
                    {isAuthenticated ? (
                        <button onClick={handleLogout}>Logout</button>
                    ) : (
                        <button><Link to="/sign-in">Login</Link></button>
                    )}
                </div>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default RootLayout;
