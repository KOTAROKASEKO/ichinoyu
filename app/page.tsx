"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/firebase";

type Message = {
  id?: string;
  text: string;
  sender: "user" | "ai";
};

// 1. ウェルカムメッセージの定数を定義
const WELCOME_MESSAGE: Message = {
  id: "welcome-message",
  text: "一乃湯にようこそいらっしゃいました。なんでもお聞きください。warm welcome to Ichinoyu. Feel free to ask me anything, in any language",
  sender: "ai",
};

export default function AIChatPage() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedChatId = localStorage.getItem("chatId");
    
    if (storedChatId) {
      setChatId(storedChatId);
    } else {
      const newChatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("chatId", newChatId);
      setChatId(newChatId);
    }
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: Message[] = [];
      snapshot.forEach((doc) =>
        list.push({ id: doc.id, ...(doc.data() as Message) })
      );
      setMessages(list);
    });

    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isSending || !chatId) return;

    setIsSending(true);
    const textToSend = input;
    setInput("");

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: textToSend,
        sender: "user",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (isComposing) return;
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[80vh] border border-gray-100">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3 shadow-sm z-10">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">Hotel Concierge</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-500 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {/* 2. ここで WELCOME_MESSAGE を先頭に追加してマップする */}
          {[WELCOME_MESSAGE, ...messages].map((m) => {
            const isAi = m.sender === "ai";
            return (
              <div key={m.id} className={`flex w-full ${isAi ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isAi
                      ? "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                      : "bg-indigo-600 text-white rounded-tr-none"
                  }`}
                >
                  <div className="prose prose-sm max-w-none [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>p]:mb-2 [&>strong]:text-indigo-700">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-100 p-4">
          <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 transition-colors focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-100">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm"
              placeholder="Type your message..."
              disabled={isSending}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
          <div className="text-center mt-2">
             <span className="text-[10px] text-gray-400">Powered by Gemini AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}