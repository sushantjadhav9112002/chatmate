import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaTrash } from 'react-icons/fa'; // Import the trash icon
import './chatList.css';
import { Link, useNavigate } from 'react-router-dom';

const Chatlist = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate(); // Initialize useNavigate hook

    const { isPending, error, data } = useQuery({
        queryKey: ['userChats'],
        queryFn: () =>
            fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
                credentials: "include",
            }).then((res) => res.json()),
    });

    // Mutation for deleting a chat
    const deleteChatMutation = useMutation({
        mutationFn: async (chatId) => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['userChats']);
        },
    });

    const handleDelete = (chatId) => {
        if (window.confirm('Are you sure you want to delete this chat?')) {
            deleteChatMutation.mutate(chatId);
        }
    };

    return (
        <div className="chatlist">
            <span className="title">DASHBOARD</span>
            <Link to="/dashboard">Create a new chat</Link>
            <Link to="/">Explore Sushant's AI</Link>
            <Link to="/">Contact</Link>
            <hr />

            <span className="title">RECENT CHATS</span>
            <div className="list">
                {isPending ? (
                    "Loading..."
                ) : error ? (
                    "Something went wrong!"
                ) : Array.isArray(data) ? (
                    data.map((chat) => (
                        <div key={chat._id} className="chat-item">
                            <Link to={`/dashboard/chats/${chat._id}`}>
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
