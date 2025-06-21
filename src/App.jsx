import React, { useState, useEffect, useRef, useCallback } from "react";
import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";
import { Settings, Zap, Sun, Moon, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

const personalities = {
  professional:
    "You are a helpful and professional AI assistant. Please provide clear, concise, and accurate information.",
  casual:
    "You're a friendly and casual AI buddy. You're here to help with anything you need. Feel free to use emojis and a conversational tone.",
  coaching:
    "You are a supportive AI coach. Your goal is to guide users, ask probing questions, and help them discover solutions on their own, rather than just giving away the answer. Encourage learning and personal growth.",
  friendly:
    "You are an enthusiastic and friendly AI assistant. You are excited to help with any questions and provide encouragement and positive feedback.",
};

function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [selectedModel, setSelectedModel] = useState("gemma:2b");
  const [personality, setPersonality] = useState("professional");
  const [chatUsage, setChatUsage] = useState({
    count: 0,
    month: new Date().getMonth(),
  });
  const [showSettings, setShowSettings] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const abortControllerRef = useRef(null);
  const chatsRef = useRef(chats);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // Load chats and settings from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem("chats");
    const savedActiveChatId = localStorage.getItem("activeChatId");
    const savedUrl = localStorage.getItem("ollamaUrl");
    const savedModel = localStorage.getItem("selectedModel");
    const savedPersonality = localStorage.getItem("personality");
    const savedTheme = localStorage.getItem("theme");
    const savedSidebarState = localStorage.getItem("sidebarCollapsed");
    const savedChatUsage = localStorage.getItem("chatUsage");
    const savedIsPro = localStorage.getItem("isPro");

    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      if (savedActiveChatId) {
        setActiveChatId(savedActiveChatId);
      } else if (parsedChats.length > 0) {
        setActiveChatId(parsedChats[0].id);
      }
    } else {
      const newChatId = uuidv4();
      const newChat = { id: newChatId, title: "New Chat", messages: [] };
      setChats([newChat]);
      setActiveChatId(newChatId);
    }

    if (savedUrl) setOllamaUrl(savedUrl);
    if (savedModel) setSelectedModel(savedModel);
    if (savedPersonality) setPersonality(savedPersonality);
    if (savedTheme) setIsDarkMode(savedTheme === "dark");
    if (savedSidebarState) setIsSidebarCollapsed(savedSidebarState === "true");
    if (savedIsPro) setIsPro(JSON.parse(savedIsPro));

    if (savedChatUsage) {
      const usage = JSON.parse(savedChatUsage);
      const currentMonth = new Date().getMonth();
      if (usage.month === currentMonth) {
        setChatUsage(usage);
      } else {
        setChatUsage({ count: 0, month: currentMonth });
      }
    }
  }, []);

  // Check for Stripe success/cancel query params
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setIsPro(true);
      alert("Upgrade successful! You are now a Pro user.");
      window.history.replaceState({}, document.title, "/");
    }

    if (query.get("canceled")) {
      alert(
        "Upgrade canceled. You can upgrade to Pro anytime from the settings."
      );
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  // Save chats and settings to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("chats", JSON.stringify(chats));
    }
    if (activeChatId) {
      localStorage.setItem("activeChatId", activeChatId);
    }
    localStorage.setItem("ollamaUrl", ollamaUrl);
    localStorage.setItem("selectedModel", selectedModel);
    localStorage.setItem("personality", personality);
    localStorage.setItem("chatUsage", JSON.stringify(chatUsage));
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    localStorage.setItem("sidebarCollapsed", isSidebarCollapsed.toString());
    localStorage.setItem("isPro", JSON.stringify(isPro));
  }, [
    chats,
    activeChatId,
    ollamaUrl,
    selectedModel,
    personality,
    chatUsage,
    isDarkMode,
    isSidebarCollapsed,
    isPro,
  ]);

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // This is for the landing page's background.
    // The chat app will use the theme classes directly.
  }, [isDarkMode]);

  // Load available models
  const loadModels = useCallback(async () => {
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models || []);
        const fastModels = ["gemma:2b", "llama3.2", "mistral:7b-instruct"];
        const availableFastModel = fastModels.find((model) =>
          data.models?.some((m) => m.name === model)
        );
        if (availableFastModel) {
          setSelectedModel(availableFastModel);
        }
      }
    } catch (error) {
      console.log("Could not load models:", error);
    }
  }, [ollamaUrl]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const updateChat = useCallback((chatId, updateFn) => {
    setChats((prevChats) =>
      prevChats.map((chat) => (chat.id === chatId ? updateFn(chat) : chat))
    );
  }, []);

  const sendMessage = useCallback(
    async (message) => {
      if (!message.trim()) return;

      const currentMonth = new Date().getMonth();
      if (
        !isPro &&
        chatUsage.month === currentMonth &&
        chatUsage.count >= 100
      ) {
        if (
          window.confirm(
            "You've reached your message limit. Upgrade to Pro for unlimited messages?"
          )
        ) {
          handleUpgrade();
        }
        return;
      }

      setIsLoading(true);
      setIsSearching(true);

      let searchResultsText = "";
      const serperApiKey = import.meta.env.VITE_SERPER_API_KEY;

      if (serperApiKey) {
        try {
          const response = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: {
              "X-API-KEY": serperApiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ q: message }),
          });
          const searchData = await response.json();
          if (searchData.organic && searchData.organic.length > 0) {
            searchResultsText = searchData.organic
              .slice(0, 5) // Take top 5 results
              .map(
                (result) =>
                  `Title: ${result.title}\nLink: ${result.link}\nSnippet: ${result.snippet}`
              )
              .join("\n\n---\n\n");
          }
        } catch (error) {
          console.error("Error fetching search results:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setIsSearching(false);
      }

      let chatToUpdateId = activeChatId;

      const currentChat = chatsRef.current.find((c) => c.id === chatToUpdateId);
      const history = currentChat ? currentChat.messages : [];

      const userMessage = {
        id: uuidv4(),
        content: message,
        role: "user",
        timestamp: new Date().toISOString(),
      };

      const assistantMessage = {
        id: uuidv4(),
        content: "",
        role: "assistant",
        timestamp: new Date().toISOString(),
      };

      updateChat(chatToUpdateId, (chat) => {
        const isNewChat = chat.messages.length === 0;
        return {
          ...chat,
          title: isNewChat ? message.substring(0, 30) : chat.title,
          messages: [...chat.messages, userMessage, assistantMessage],
        };
      });

      if (!isPro) {
        setChatUsage((prevUsage) => {
          const currentMonth = new Date().getMonth();
          if (prevUsage.month !== currentMonth) {
            return { count: 1, month: currentMonth };
          }
          return { ...prevUsage, count: prevUsage.count + 1 };
        });
      }

      const conversationHistory = [...history, userMessage]
        .map((msg) => {
          if (msg.role === "user") {
            return `User: ${msg.content}`;
          } else if (msg.role === "assistant" && msg.content) {
            return `Assistant: ${msg.content}`;
          }
          return null;
        })
        .filter(Boolean)
        .join("\n\n");

      const finalPrompt = `${personalities[personality]}
${
  searchResultsText
    ? `\nWeb Search Results (for context):\n${searchResultsText}`
    : ""
}

Conversation History:
${conversationHistory}

Assistant:`;

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`${ollamaUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            model: selectedModel,
            prompt: finalPrompt,
            stream: true,
            options: {
              num_predict: 512,
              temperature: 0.7,
              top_p: 0.9,
              top_k: 40,
              repeat_penalty: 1.1,
              seed: 42,
            },
          }),
        });

        if (!response.ok) throw new Error("Failed to get response from Ollama");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim() === "") continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                updateChat(chatToUpdateId, (chat) => ({
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg.id === assistantMessage.id
                      ? {
                          ...msg,
                          content: (msg.content + parsed.response).replace(
                            /<company_name>/g,
                            "AIBud"
                          ),
                        }
                      : msg
                  ),
                }));
              }
            } catch (e) {
              console.error("Error parsing streaming JSON", e);
            }
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error:", error);
          updateChat(activeChatId, (chat) => ({
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    content: "Sorry, I encountered an error.",
                    isError: true,
                  }
                : msg
            ),
          }));
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      activeChatId,
      ollamaUrl,
      selectedModel,
      personality,
      updateChat,
      chatUsage,
      isPro,
    ]
  );

  const handleUpgrade = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:4242/create-checkout-session",
        {
          method: "POST",
        }
      );
      const session = await response.json();
      window.location.href = session.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  }, []);

  const handleModelChange = useCallback(
    (newModel) => {
      if (!isPro && newModel !== selectedModel) {
        if (
          window.confirm(
            "Changing AI models is a Pro feature. Upgrade now for access to all models?"
          )
        ) {
          handleUpgrade();
        }
      } else {
        setSelectedModel(newModel);
      }
    },
    [isPro, selectedModel, handleUpgrade]
  );

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  const startNewChat = useCallback(() => {
    const newChatId = uuidv4();
    const newChat = { id: newChatId, title: "New Chat", messages: [] };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChatId);
    setIsSidebarCollapsed(false);
  }, []);

  const renameChat = useCallback(
    (chatId, newTitle) => {
      updateChat(chatId, (chat) => ({ ...chat, title: newTitle }));
    },
    [updateChat]
  );

  const switchChat = useCallback((chatId) => {
    setActiveChatId(chatId);
  }, []);

  const toggleTheme = useCallback(() => setIsDarkMode((prev) => !prev), []);
  const toggleSidebar = useCallback(
    () => setIsSidebarCollapsed((prev) => !prev),
    []
  );

  const deleteChat = useCallback(
    (chatId) => {
      setChats((prevChats) => {
        const chatsAfterDeletion = prevChats.filter((c) => c.id !== chatId);
        if (activeChatId === chatId) {
          if (chatsAfterDeletion.length > 0) {
            const deletedChatIndex = prevChats.findIndex(
              (c) => c.id === chatId
            );
            const newActiveIndex = Math.max(0, deletedChatIndex - 1);
            setActiveChatId(chatsAfterDeletion[newActiveIndex].id);
          } else {
            startNewChat();
          }
        }
        return chatsAfterDeletion;
      });
    },
    [activeChatId, startNewChat]
  );

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  return (
    <div className="flex h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={startNewChat}
        onSwitchChat={switchChat}
        onRenameChat={renameChat}
        onDeleteChat={deleteChat}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onShowSettings={() => setShowSettings(true)}
        chatUsage={chatUsage}
        isPro={isPro}
      />
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <Chat
            chat={activeChat}
            onSendMessage={sendMessage}
            isLoading={isLoading}
            isSearching={isSearching}
            onStopGeneration={stopGeneration}
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <div className="max-w-md">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-light-primary/20 text-light-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to AIBud</h2>
              <p className="text-light-secondary dark:text-dark-secondary">
                Select a chat from the sidebar or start a new one to begin.
              </p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-40"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md mx-auto mt-20 p-6 rounded-lg shadow-xl bg-light-surface dark:bg-dark-surface"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="ollamaUrl"
                    className="block text-sm font-medium text-light-secondary dark:text-dark-secondary"
                  >
                    Ollama URL
                  </label>
                  <input
                    type="text"
                    id="ollamaUrl"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="w-full p-2 mt-1 rounded bg-light-background dark:bg-dark-background border border-gray-300 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label
                    htmlFor="model"
                    className="block text-sm font-medium text-light-secondary dark:text-dark-secondary"
                  >
                    AI Model
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      id="model"
                      value={selectedModel}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="flex-grow w-full p-2 mt-1 rounded bg-light-background dark:bg-dark-background border border-gray-300 dark:border-gray-700"
                    >
                      {availableModels.map((model) => (
                        <option key={model.name} value={model.name}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={loadModels}
                      className="p-2 mt-1 rounded-md bg-light-primary text-white"
                    >
                      <Zap size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="personality"
                    className="block text-sm font-medium text-light-secondary dark:text-dark-secondary"
                  >
                    AI Personality
                  </label>
                  <select
                    id="personality"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    className="w-full p-2 mt-1 rounded bg-light-background dark:bg-dark-background border border-gray-300 dark:border-gray-700"
                  >
                    {Object.keys(personalities).map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-light-secondary dark:text-dark-secondary">
                    Theme
                  </span>
                  <div className="flex items-center space-x-2">
                    <Sun
                      size={18}
                      className={`${!isDarkMode ? "text-yellow-500" : ""}`}
                    />
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isDarkMode
                          ? "bg-light-primary"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDarkMode ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <Moon
                      size={18}
                      className={`${isDarkMode ? "text-blue-400" : ""}`}
                    />
                  </div>
                </div>
                {!isPro ? (
                  <div className="p-4 bg-light-background dark:bg-dark-background rounded-lg">
                    <h3 className="font-bold text-lg text-light-primary dark:text-dark-primary">
                      Upgrade to Pro
                    </h3>
                    <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1">
                      Unlock unlimited messages and support the creator.
                    </p>
                    <button
                      onClick={handleUpgrade}
                      className="w-full mt-4 px-4 py-2 rounded-md bg-light-primary text-white font-semibold hover:bg-light-primary/90"
                    >
                      Upgrade Now
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg text-center">
                    <h3 className="font-bold text-lg text-green-700 dark:text-green-300">
                      You are a Pro User!
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Thank you for your support!
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 rounded-md bg-light-primary text-white font-semibold"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
