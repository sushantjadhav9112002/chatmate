import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './rootLayout.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const RootLayout = () => {
    const navigate = useNavigate();
    const location = useLocation(); // 👈 Track current route
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("token")));

    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(Boolean(localStorage.getItem("token")));
        };

        // Listen for storage changes (works across tabs and pages)
        const handleStorageChange = () => checkAuth();
        window.addEventListener("storage", handleStorageChange);

        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // 👇 Run whenever route changes (ensures UI updates when navigating)
    useEffect(() => {
        setIsAuthenticated(Boolean(localStorage.getItem("token")));
    }, [location.pathname]); // Track route changes

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false); // Force UI update
        navigate("/sign-in");
    };

    return (
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
    );
};

export default RootLayout;
