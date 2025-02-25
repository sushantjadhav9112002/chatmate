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
import { v4 as uuidv4 } from 'uuid';

const ChatPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [chatId, setChatId] = useState("");

    useEffect(() => {
        const pathSegments = location.pathname.split('/');
        let extractedChatId = pathSegments[pathSegments.length - 1];

        if (!extractedChatId || extractedChatId === "undefined" || extractedChatId === "[object Object]") {
            console.error("Invalid Chat ID detected:", extractedChatId);
            extractedChatId = uuidv4(); // Generate a new chat ID
            navigate(`/dashboard/chats/${extractedChatId}`); // Redirect with new chat ID
        }

        setChatId(extractedChatId);
    }, [location, navigate]);

    const { isPending, error, data } = useQuery({
        queryKey: ['chat', chatId],
        queryFn: async () => {
            if (!chatId || chatId === "undefined") {
                console.error("Chat ID is undefined, aborting API call.");
                return Promise.reject(new Error("Chat ID is missing"));
            }

            console.log("Extracted chatId:", chatId);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
                credentials: "include",
            });
            return response.json();
        },
        enabled: !!chatId, // Prevent API call if chatId is missing
    });

    return (
        <div className='chatpage'>
            <div className="wrapper">
                <div className="chat">
                    {isPending ? "Loading..." : error ? "Something went wrong" : data?.history?.map((message, i) => (
                        <>
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
                            <div className={message.role === "user" ? "message user" : "message"} key={i}>
                                <ReactMarkdown 
                                    children={message.parts[0]?.text || ""}
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                />
                            </div>
                        </>
                    ))}

                    {data && <NewPrompt data={data} />}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
