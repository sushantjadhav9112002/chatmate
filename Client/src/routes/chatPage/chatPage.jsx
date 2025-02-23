import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import NewPrompt from '../../components1/newprompt/NewPrompt';
import { IKImage } from 'imagekitio-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const ChatPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // ✅ Ensure chatId is properly extracted
    const chatId = location.pathname.split('/').pop()?.trim();
    
    useEffect(() => {
        if (!chatId || chatId === "undefined" || chatId === "[object Object]") {
            console.error("Chat ID is missing or invalid:", chatId);
            navigate('/'); // Redirect to home or an error page
        }
    }, [chatId, navigate]);

    const { isPending, error, data } = useQuery({
        queryKey: ['chat', chatId],
        queryFn: async () => {
            if (!chatId || chatId === "undefined" || chatId === "[object Object]") {
                throw new Error("Invalid Chat ID");
            }

            console.log("Using Chat ID:", chatId);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
                method: "GET",
                credentials: "include", // Ensures cookies are sent
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token") || ""}` // If using JWT
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return response.json();
        },
        enabled: !!chatId, // Prevent API call if chatId is missing
    });

    return (
        <div className='chatpage'>
            <div className="wrapper">
                <div className="chat">
                    {isPending ? "Loading..." : error ? "Something went wrong" : data?.history?.map((message, i) => (
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
                    ))}

                    {data && <NewPrompt data={data} />}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
