"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2 } from "lucide-react";

interface Message {
    id: string;
    role: "bot" | "user";
    text: string;
    time: string;
}

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const suggestionChips = [
    "What products do you have?",
    "How does AR try-on work?",
    "What's your return policy?",
    "How long does shipping take?",
];

function getTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId] = useState(() => crypto.randomUUID());
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "bot",
            text: "👋 Hi! I'm **ARBot**, your ARVision shopping assistant.\n\nI can help you find products, track orders, explain AR try-on, and more. How can I help you today?",
            time: getTime(),
        },
    ]);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 200);
    }, [open]);

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: trimmed,
            time: getTime(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`${BACKEND}/api/chatbot/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: trimmed, sessionId }),
            });
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString() + "-bot",
                    role: "bot",
                    text: data.reply ?? "Sorry, I couldn't get a response. Please try again.",
                    time: getTime(),
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString() + "-err",
                    role: "bot",
                    text: "⚠️ Connection error. Please make sure the server is running.",
                    time: getTime(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    /** Render bot text with basic markdown bold (**text**) and newlines */
    function renderBotText(text: string) {
        return text.split("\n").map((line, i) => {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
                <span key={i}>
                    {parts.map((p, j) =>
                        j % 2 === 1 ? <strong key={j}>{p}</strong> : p
                    )}
                    {i < text.split("\n").length - 1 && <br />}
                </span>
            );
        });
    }

    return (
        <>
            {/* Floating toggle button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${open
                        ? "bg-gray-700 rotate-0 scale-95"
                        : "bg-gradient-to-br from-green-400 to-green-600 hover:scale-110"
                    }`}
                aria-label="Open chat"
            >
                {open ? (
                    <X size={22} className="text-white" />
                ) : (
                    <>
                        <MessageCircle size={24} className="text-white" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                    </>
                )}
            </button>

            {/* Chat window */}
            <div
                className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] flex flex-col rounded-2xl shadow-2xl border border-white/60 overflow-hidden transition-all duration-300 ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"
                    }`}
                style={{ height: "520px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)" }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-white text-sm">ARBot</p>
                        <p className="text-green-100 text-xs">ARVision Shopping Assistant</p>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="text-white/70 hover:text-white transition-colors p-1"
                    >
                        <Minimize2 size={16} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            {/* Avatar */}
                            <div
                                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${msg.role === "bot"
                                        ? "bg-gradient-to-br from-green-400 to-green-600"
                                        : "bg-gray-200"
                                    }`}
                            >
                                {msg.role === "bot" ? (
                                    <Bot size={14} className="text-white" />
                                ) : (
                                    <User size={14} className="text-gray-500" />
                                )}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[78%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                <div
                                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                            ? "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-sm"
                                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                        }`}
                                >
                                    {msg.role === "bot" ? renderBotText(msg.text) : msg.text}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-0.5 px-1">{msg.time}</span>
                            </div>
                        </div>
                    ))}

                    {/* Loading dots */}
                    {loading && (
                        <div className="flex items-end gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                                <Bot size={14} className="text-white" />
                            </div>
                            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                                <div className="flex gap-1 items-center h-4">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Suggestion chips — show after welcome only */}
                {messages.length === 1 && (
                    <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                        {suggestionChips.map((chip) => (
                            <button
                                key={chip}
                                onClick={() => sendMessage(chip)}
                                className="text-xs px-3 py-1.5 rounded-full border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-all"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <form
                    onSubmit={handleSubmit}
                    className="px-3 py-3 border-t border-gray-100 flex items-center gap-2 bg-white"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all disabled:opacity-60"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex-shrink-0"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </form>
            </div>
        </>
    );
}
