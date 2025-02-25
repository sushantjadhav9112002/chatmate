import './chatPage.css';
import { useEffect } from 'react';
import NewPrompt from '../../components1/newprompt/NewPrompt';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { IKImage } from 'imagekitio-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useNavigate } from 'react-router-dom';
// import { useEffect } from 'react';

const chatPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract chatId from query params (if available)
    const searchParams = new URLSearchParams(location.search);
    let chatId = searchParams.get("chatId");

    // If not in query params, fallback to pathname
    if (!chatId) {
        const pathSegments = location.pathname.split('/');
        chatId = pathSegments[pathSegments.length - 1];
    }

    useEffect(() => {
        if (!chatId || chatId === "undefined" || chatId.trim() === "") {
            console.error("Chat ID is missing. Redirecting...");
            navigate('/'); // Redirect to home or error page
        }
    }, [chatId, navigate]);

    const { isPending, error, data } = useQuery({
        queryKey: ['chat', chatId],
        queryFn: () => {
            if (!chatId || chatId === "undefined") {
                console.error("Chat ID is undefined, aborting API call.");
                return Promise.reject(new Error("Chat ID is missing"));
            }
            console.log("Extracted chatId:", chatId);
            return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
                credentials: "include",
            }).then((res) => res.json());
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

export default chatPage;
