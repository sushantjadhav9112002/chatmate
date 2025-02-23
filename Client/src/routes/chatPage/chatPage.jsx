import './chatPage.css';
import { useEffect, useState } from 'react';
import NewPrompt from '../../components1/newprompt/NewPrompt';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { IKImage } from 'imagekitio-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const ChatPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [chatId, setChatId] = useState(null);

    // ✅ Extract `chatId` properly
    useEffect(() => {
        console.log("Full location object:", location);
        console.log("Extracted pathname:", location.pathname);

        const extractedId = location.pathname.split('/').filter(Boolean).pop();
        console.log("Extracted chatId:", extractedId);

        if (!extractedId || extractedId === "undefined" || extractedId === "[object Object]") {
            console.error("Invalid Chat ID. Redirecting...");
            navigate('/'); // Redirect to home page if invalid
        } else {
            setChatId(extractedId);
        }
    }, [location.pathname, navigate]);

    // ✅ API call only runs when `chatId` is valid
    const { isPending, error, data } = useQuery({
        queryKey: ['chat', chatId],
        queryFn: async () => {
            if (!chatId) {
                console.error("Chat ID is missing, aborting API call.");
                return Promise.reject(new Error("Chat ID is missing"));
            }

            try {
                console.log("Fetching chat data for chatId:", chatId);

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
                    method: "GET",
                    credentials: "include", // Ensures session is sent
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`, // If using token-based auth
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    console.error(`API Error: ${response.status} ${response.statusText}`);
                    return Promise.reject(new Error(`API Error: ${response.status}`));
                }

                return response.json();
            } catch (err) {
                console.error("Fetch error:", err);
                throw err;
            }
        },
        enabled: !!chatId, // Prevent API call if chatId is missing
    });

    return (
        <div className='chatpage'>
            <div className="wrapper">
                <div className="chat">
                    {isPending ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p>Error: {error.message}</p>
                    ) : Array.isArray(data?.history) ? (
                        data.history.map((message, i) => (
                            <div key={i}>
                                {message.img && (
                                    <IKImage
                                        urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                                        path={message.img}
                                        height="300"
                                        width="400"
                                        transformation={[{ height: 300, width: 400 }]}
                                        loading='lazy'
                                        lqip={{ active: true, quality: 20 }}
                                    />
                                )}
                                <div className={message.role === "user" ? "message user" : "message"}>
                                    <ReactMarkdown 
                                        children={message.parts[0]?.text || ""}
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight]}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No chat history available.</p>
                    )}
    
                    {data && <NewPrompt data={data} />}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
