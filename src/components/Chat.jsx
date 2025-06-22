import React, { useRef, useEffect, useState } from "react";
import {
  Send,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  Square,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import hljs from "highlight.js";
import Markdown from "react-markdown";

const TypingIndicator = React.memo(() => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center space-x-2"
  >
    <motion.div
      animate={{
        y: [0, -4, 0],
        transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
      }}
      className="w-2 h-2 bg-text-secondary rounded-full"
    />
    <motion.div
      animate={{
        y: [0, -4, 0],
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        },
      }}
      className="w-2 h-2 bg-text-secondary rounded-full"
    />
    <motion.div
      animate={{
        y: [0, -4, 0],
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        },
      }}
      className="w-2 h-2 bg-text-secondary rounded-full"
    />
  </motion.div>
));

const CodeBlock = React.memo(({ language, value, isDarkMode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-md my-4 bg-surface-secondary text-sm overflow-hidden">
      <div className="flex justify-between items-center text-xs text-text-secondary px-4 py-2 border-b border-border">
        <span>{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-text"
        >
          {copied ? (
            <>
              <Check size={14} /> Copied
            </>
          ) : (
            <>
              <Copy size={14} /> Copy code
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto">
        <code
          className="hljs p-4 block"
          dangerouslySetInnerHTML={{
            __html: hljs.highlight(value, {
              language: language || "plaintext",
            }).value,
          }}
        />
      </pre>
    </div>
  );
});

const ChatMessage = React.memo(({ message, isDarkMode, msgKey }) => {
  const isUser = message.role === "user";
  const isError = message.isError;
  const isAssistant = message.role === "assistant";

  return (
    <motion.div
      key={msgKey}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 my-4 items-start ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && (
        <div
          className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
            isError
              ? "bg-red-500/20 text-red-500"
              : "bg-primary/20 text-primary"
          }`}
        >
          {isError ? <AlertTriangle size={18} /> : <Zap size={18} />}
        </div>
      )}
      <div
        className={`max-w-xl p-4 rounded-2xl shadow-sm relative ${
          isUser
            ? "bg-primary text-white rounded-br-lg"
            : `text-text bg-surface rounded-bl-lg`
        } ${
          isError
            ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200"
            : ""
        }`}
      >
        <AnimatePresence>
          {isAssistant && message.content === "" ? (
            <TypingIndicator />
          ) : (
            <Markdown
              components={{
                code: ({ node, inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <CodeBlock
                      isDarkMode={isDarkMode}
                      language={match[1]}
                      value={String(children).replace(/\n$/, "")}
                      {...props}
                    />
                  ) : (
                    <code
                      className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-primary"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                a: ({ node, ...props }) => {
                  let href = props.href;
                  if (href && !/^(https?:\/\/|\/|#)/.test(href)) {
                    href = `https://${href}`;
                  }
                  return (
                    <a
                      {...props}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:opacity-80"
                    />
                  );
                },
              }}
            >
              {message.content}
            </Markdown>
          )}
        </AnimatePresence>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-text-secondary/20 text-text-secondary flex-shrink-0 flex items-center justify-center">
          U
        </div>
      )}
    </motion.div>
  );
});

const ChatWelcomeMessage = React.memo(() => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center h-full text-center p-4"
  >
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-primary/20 text-primary">
      <Sparkles className="w-8 h-8" />
    </div>
    <h2 className="text-2xl font-bold mb-2">AIBud</h2>
    <p className="text-text-secondary">
      Start a conversation by typing your message below.
    </p>
  </motion.div>
));

const Chat = React.memo(
  ({
    chat,
    onSendMessage,
    isLoading,
    isSearching,
    onStopGeneration,
    isDarkMode,
  }) => {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages]);

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [input]);

    const handleSend = (e) => {
      e.preventDefault();
      if (input.trim()) {
        onSendMessage(input.trim());
        setInput("");
      }
    };

    return (
      <div className="flex flex-col h-full">
        <header className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold">{chat?.title || "Chat"}</h2>
        </header>
        <div className="flex-1 p-4 overflow-y-auto">
          <AnimatePresence>
            {chat?.messages && chat.messages.length > 0 ? (
              chat.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  msgKey={msg.id}
                  message={msg}
                  isDarkMode={isDarkMode}
                />
              ))
            ) : (
              <ChatWelcomeMessage />
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border">
          <form onSubmit={handleSend} className="relative">
            <textarea
              ref={textareaRef}
              id="chat-input"
              name="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSend(e);
                }
              }}
              placeholder="Type your message..."
              className="w-full p-4 pr-24 rounded-lg bg-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-text-secondary animate-pulse">
                    {isSearching ? "Searching..." : "Generating..."}
                  </span>
                  <button
                    type="button"
                    onClick={onStopGeneration}
                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <Square size={20} />
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 rounded-full bg-primary text-white disabled:bg-text-secondary/50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }
);

export default Chat;
