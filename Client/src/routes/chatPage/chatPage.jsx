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

    // Extract chatId properly
    const [chatId, setChatId] = useState('');

    useEffect(() => {
        const extractedId = location.pathname.split('/').pop();
        console.log("Extracted chatId:", extractedId); // Debugging

        if (!extractedId || extractedId === "undefined" || extractedId === "[object Object]") {
            console.error("Invalid Chat ID. Redirecting...");
            navigate('/'); // Redirect to home if invalid
        } else {
            setChatId(extractedId);
        }
    }, [location.pathname, navigate]);

    // Fetch chat data only if chatId is valid
    const { isPending, error, data } = useQuery({
        queryKey: ['chat', chatId],
        queryFn: async () => {
            if (!chatId || chatId === "undefined" || chatId === "[object Object]") {
                throw new Error("Chat ID is missing");
            }

            console.log("Fetching chat data for chatId:", chatId);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            return response.json();
        },
        enabled: !!chatId, // Ensures query only runs if chatId is valid
    });

    return (
        <div className='chatpage'>
            <div className="wrapper">
                <div className="chat">
                    {isPending ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p>{error.message}</p>
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
