import './chatPage.css';
import { useEffect } from 'react';
import NewPrompt from '../../components1/newprompt/NewPrompt';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { IKImage } from 'imagekitio-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const ChatPage = () => {
    const path = useLocation().pathname;
    const chatId = path.split('/').pop();
    const navigate = useNavigate();

    useEffect(() => {
        if (!chatId || chatId === "undefined") {
            console.error("Chat ID is missing. Redirecting...");
            navigate('/');
        }
    }, [chatId, navigate]);

    console.log("Using API URL:", import.meta.env.VITE_API_URL);

    const { isPending, error, data } = useQuery({
        queryKey: ['chat', chatId],
        queryFn: async () => {
            if (!chatId || chatId === "undefined") {
                return Promise.reject(new Error("Chat ID is missing"));
            }
            console.log("Extracted chatId:", chatId);

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`, // Ensure user is authenticated
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
        enabled: !!chatId,
    });

    return (
        <div className='chatpage'>
            <div className="wrapper">
                <div className="chat">
                    {isPending ? "Loading..." : error ? `Error: ${error.message}` : data?.history?.map((message, i) => (
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
