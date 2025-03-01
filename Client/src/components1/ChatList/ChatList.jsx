import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaTrash } from 'react-icons/fa'; // Import the trash icon
import './chatList.css';
import { Link, useNavigate } from 'react-router-dom';

const Chatlist = ({ setIsOpen }) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate(); // Initialize useNavigate hook

    // Retrieve token from localStorage
    const token = localStorage.getItem("token"); // Get token

    const { isPending, error, data } = useQuery({
        queryKey: ['userChats'],
        queryFn: () =>
            fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Add token to request
                },
                credentials: "include",
            }).then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch user chats");
                }
                return res.json();
            }),
    });

    // Mutation for deleting a chat
    const deleteChatMutation = useMutation({
        mutationFn: async (chatId) => {
            if (!token) {
                throw new Error("User is not authenticated");
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error("Failed to delete chat");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['userChats']);
            navigate("/dashboard"); // Redirect to dashboard after deletion
        },
    });

    const handleDelete = (chatId) => {
        if (window.confirm('Are you sure you want to delete this chat?')) {
            deleteChatMutation.mutate(chatId);
        }
    };

    // Close sidebar when a link is clicked (on mobile)
    const handleLinkClick = () => {
        if (window.innerWidth <= 768) {
            setIsOpen(false);
        }
    };

    return (
        <div className="chatlist">
            <span className="title">DASHBOARD</span>
            <Link to="/dashboard" onClick={handleLinkClick}>Create a new chat</Link>
            <Link to="/" onClick={handleLinkClick}>Explore Sushant's AI</Link>
            <Link to="/" onClick={handleLinkClick}>Contact</Link>
            <hr />

            <span className="title">RECENT CHATS</span>
            <div className="list">
                {isPending ? (
                    "Loading..."
                ) : error ? (
                    <p className="error">Something went wrong: {error.message}</p>
                ) : Array.isArray(data) && data.length > 0 ? (
                    data.map((chat) => (
                        <div key={chat._id} className="chat-item">
                            <Link to={`/dashboard/chats/${chat._id}`} onClick={handleLinkClick}>
                                {chat.title.length > 10 ? chat.title.slice(0, 10) + "..." : chat.title}
                            </Link>
                            <FaTrash onClick={() => handleDelete(chat._id)} className="delete-icon" />
                        </div>
                    ))
                ) : (
                    <p>No chats available.</p>
                )}
            </div>
            <hr />
            <div className="upgrade">
                <img src="/logo.png" alt="Upgrade" />
                <div className="texts">
                    <span>Upgrade to Sushant's AI Pro</span>
                    <span>Get unlimited access to all the features</span>
                </div>
            </div>
        </div>
    );
};

export default Chatlist;