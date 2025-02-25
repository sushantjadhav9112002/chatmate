import { useQueryClient, useMutation } from '@tanstack/react-query';
import './dashBoardpage.css';
import { useNavigate } from 'react-router-dom';

const dashBoardpage = () => {

    const queryClient = useQueryClient();  // Use useQueryClient instead of creating a new QueryClient
    const navigate = useNavigate();

    const token = localStorage.getItem("token") || "";
    

    const mutation = useMutation({
        mutationFn: async (text) => {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` })  // ✅ Send only if token exists
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);  // ✅ Handle API errors properly
            }

            return response.json();
        },
        onSuccess: (data) => {
            if (data) {  // ✅ Ensure a valid ID is returned
                queryClient.invalidateQueries({ queryKey: ['userChats'] });
                navigate(`/dashboard/chats/${data}`);
            } else {
                console.error("Invalid chat ID received from API:", data);
            }
        },
        onError: (error) => {
            console.error("Error creating chat:", error);
        }
    });


    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = e.target.text.value;
        if (!text) return;

        mutation.mutate(text);
    };

    return (
        <div className='dashboardpage'>
            <div className="texts">
                <div className="logo">
                    <img src="/logo.png" alt="" />
                    <h1>Sushant's AI</h1>
                </div>

                <div className="options">
                    <div className="option">
                        <img src="/chat.png" alt="" />
                        <span>Create a New Chat</span>
                    </div>
                    <div className="option">
                        <img src="/image.png" alt="" />
                        <span>Analyze Images</span>
                    </div>
                    <div className="option">
                        <img src="/code.png" alt="" />
                        <span>Help me with Code</span>
                    </div>
                </div>

            </div>
            <div className="formcontainer">
                <form onSubmit={handleSubmit}>
                    <input type="text" name='text' placeholder='Ask me anything...' />
                    <button>
                        <img src="/arrow.png" alt="" />
                    </button>
                </form>
            </div>
        </div>
    )
}

export default dashBoardpage;
