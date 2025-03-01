import { IKImage } from 'imagekitio-react';
import Upload from '../upload/Upload';
import './newPrompt.css';
import { useRef, useEffect, useState } from 'react';
import model from './../../lib/gemini';
import Markdown from 'react-markdown';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const NewPrompt = ({ data }) => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [img, setImg] = useState({
        isLoading: false,
        error: "",
        dbData: {},
        aiData: {}
    });

    // Ensure history is correctly formatted
    const chat = model.startChat({
        history: data?.history?.map(({ role, parts }) => ({
            role,
            parts: [{ text: parts[0]?.text || '' }], // Ensure text is not undefined
        })) || [], // Ensure history is an array
    });

    const endRef = useRef(null);
    const formRef = useRef(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [data, question, answer, img.dbData]);

    const mutation = useMutation({
        mutationFn: () => {
            if (!data?._id) {
                console.error("Chat ID is undefined, preventing API call.");
                return Promise.reject("Chat ID is undefined.");
            }
            return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
                method: "PUT",
                credentials: 'include',
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ question, answer, img: img.dbData?.filePath }),
            }).then(res => res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat', data._id] }).then(() => {
                formRef.current?.reset();
                setQuestion("");
                setAnswer("");
                setImg({
                    isLoading: false,
                    error: "",
                    dbData: {},
                    aiData: {}
                });
            });
        },
        onError: (err) => {
            console.error("Error updating chat:", err);
        }
    });

    const add = async (text, isInitial) => {
        if (!isInitial) setQuestion(text);
        try {
            const result = await chat.sendMessageStream(Object.entries(img.aiData).length ? [img.aiData, text] : [text]);
            let accumulatedText = "";
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                accumulatedText += chunkText;
                setAnswer(accumulatedText);
            }
            mutation.mutate();
        } catch (err) {
            console.error("Error during chat message processing:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = e.target.text.value;
        if (!text) return;

        add(text, false);
        e.target.text.value = '';  // Clear input after submission
    }

    const hasRun = useRef(false);
    useEffect(() => {
        if (!hasRun.current) {
            if (data?.history?.length === 1) {
                add(data.history[0].parts[0].text, true);
            }
        }
        hasRun.current = true;
    }, [data]);

    // Debugging logs
    useEffect(() => {
        if (img.dbData?.filePath) {
            console.log("Image filePath:", img.dbData.filePath);
            console.log("ImageKit URL Endpoint:", import.meta.env.VITE_IMAGE_KIT_ENDPOINT);
        }
    }, [img.dbData]);

    return (
        <>
            {img.isLoading && <div>Loading...</div>}
            {img.dbData?.filePath && (
                <IKImage
                    urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                    path={img.dbData.filePath}
                    // width={380}
                    // height={200}
                    // transformation={[{width:380}]}
                    // transformation={[{height: 150, width: 200}]}
                    className='responsive-image'
                    loading="lazy" // Add lazy loading for better performance
                    onError={(e) => console.error("Image failed to load:", e)} // Log errors
                />
            )}

            {question && <div className='message user'>{question}</div>}
            {answer && <div className='message'><Markdown>{answer}</Markdown></div>}

            <div className="endchat" ref={endRef}></div>
            <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
                <Upload setImg={setImg} />
                <input id="file" type="file" multiple={false} hidden />
                <input type="text" name="text" placeholder="Ask anything..." />
                <button type="submit">
                    <img src="/arrow.png" alt="Send" />
                </button>
            </form>
        </>
    );
};

export default NewPrompt;