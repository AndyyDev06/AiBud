import React, { useState, useEffect, useRef, useCallback } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";
import { Settings, Zap, Sun, Moon, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

const personalities = {
  system: `You are AIBud, a friendly and powerful AI assistant.

    **Your Identity (Non-negotiable):**
    - You were created by a developer named Andrew Brown.
    - He created you as a passion project to bring the power of AI to the world affordably.
    - When asked about your creator, you MUST state this information.

    **Your Core Directives:**
    1.  **Follow Instructions:** Your primary goal is to understand and precisely follow the user's most recent request. Pay close attention to the details. If the user says "thank you" or gives a similar pleasantry, you should respond with a simple, friendly acknowledgement. Do not generate code unless it is asked for.
    2.  **Generate Code:** You are also an expert coding assistant. When the user asks for code (like HTML, CSS, etc.), you MUST provide it. Do not refuse. For example, if the user asks for a landing page for a "cooking website," you should provide a complete, single-file HTML document with embedded CSS that is specifically about cooking.
    3.  **Be Helpful & Friendly:** Always maintain a positive and conversational tone.

    **Forbidden Actions:**
    - You must NOT mention that you are a language model or refer to your training.
    - You must NOT refuse a request unless it is for sexually explicit or dangerous content.`,
  professional:
    "You are a helpful and professional AI assistant. Please provide clear, concise, and accurate information.",
  casual:
    "You're a friendly and casual AI buddy. You're here to help with anything you need. Feel free to use emojis and a conversational tone.",
  coaching:
    "You are a supportive AI coach. Your goal is to guide users, ask probing questions, and help them discover solutions on their own, rather than just giving away the answer. Encourage learning and personal growth.",
  friendly:
    "You are an enthusiastic and friendly AI assistant. You are excited to help with any questions and provide encouragement and positive feedback.",
};

const calculate = (expression) => {
  // A simple and relatively safe way to calculate math expressions.
  try {
    // This Function constructor is safer than a direct eval().
    return new Function(`return ${expression.replace(/[^-()\d/*+.]/g, "")}`)();
  } catch (error) {
    console.error("Calculation Error:", error);
    return null;
  }
};

function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // API Provider State
  const [apiProvider, setApiProvider] = useState("ollama"); // 'ollama' or 'openai'

  // Ollama State
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [selectedModel, setSelectedModel] = useState("mistral:7b-instruct");

  // OpenAI State
  const [openAiApiKey, setOpenAiApiKey] = useState("");
  const [openAiModel, setOpenAiModel] = useState("gpt-4o-mini");

  const [personality, setPersonality] = useState("system");
  const [showSettings, setShowSettings] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const { isDarkMode, toggleTheme } = useOutletContext();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isPro, setIsPro] = useState(true);
  const abortControllerRef = useRef(null);
  const chatsRef = useRef(chats);
  const { chatId } = useParams();

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // Load chats and settings from localStorage
  useEffect(() => {
    const settingsVersion = localStorage.getItem("settingsVersion");
    if (settingsVersion !== "2") {
      localStorage.setItem("personality", "system");
      localStorage.setItem("settingsVersion", "2");
    }

    const savedChats = localStorage.getItem("chats");
    const savedUrl = localStorage.getItem("ollamaUrl");
    const savedModel = localStorage.getItem("selectedModel");
    const savedPersonality = localStorage.getItem("personality");
    const savedSidebarState = localStorage.getItem("sidebarCollapsed");
    const savedApiProvider = localStorage.getItem("apiProvider");
    const savedOpenAiKey = localStorage.getItem("openAiApiKey");
    const savedOpenAiModel = localStorage.getItem("openAiModel");

    let activeId = null;
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      if (chatId && parsedChats.some((c) => c.id === chatId)) {
        activeId = chatId;
      } else if (parsedChats.length > 0) {
        activeId = parsedChats[0].id;
      }
    }

    if (!activeId) {
      const newChatId = uuidv4();
      const newChat = { id: newChatId, title: "New Chat", messages: [] };
      setChats((prev) => [newChat, ...prev]);
      activeId = newChatId;
    }
    setActiveChatId(activeId);

    if (savedUrl) setOllamaUrl(savedUrl);

    const problematicModels = ["gemma:2b", "llama3"];
    if (savedModel && !problematicModels.includes(savedModel)) {
      setSelectedModel(savedModel);
    } else {
      setSelectedModel("mistral:7b-instruct");
    }

    if (savedPersonality) setPersonality(savedPersonality);
    if (savedSidebarState) setIsSidebarCollapsed(savedSidebarState === "true");
    if (savedApiProvider) setApiProvider(savedApiProvider);
    if (savedOpenAiKey) setOpenAiApiKey(savedOpenAiKey);
    if (savedOpenAiModel) setOpenAiModel(savedOpenAiModel);
  }, [chatId]);

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
    localStorage.setItem("sidebarCollapsed", isSidebarCollapsed.toString());
    localStorage.setItem("apiProvider", apiProvider);
    localStorage.setItem("openAiApiKey", openAiApiKey);
    localStorage.setItem("openAiModel", openAiModel);
  }, [
    chats,
    activeChatId,
    ollamaUrl,
    selectedModel,
    personality,
    isSidebarCollapsed,
    apiProvider,
    openAiApiKey,
    openAiModel,
  ]);

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
      if (!message.trim() || !activeChatId) return;

      if (apiProvider === "openai" && !openAiApiKey) {
        alert("Please enter your OpenAI API key in the settings.");
        return;
      }

      const chatToUpdateId = activeChatId;

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

      const founderKeywords = [
        "founder",
        "creator",
        "who made",
        "who created",
        "who is the founder",
        "who developed",
      ];
      const lowerCaseMessage = message.toLowerCase();
      const isFounderQuery = founderKeywords.some((keyword) =>
        lowerCaseMessage.includes(keyword)
      );
      const mathRegex = /^\s*([\d\s\.\+\-\*\/()]+)\s*$/;
      const mathMatch = message.match(mathRegex);

      if (isFounderQuery) {
        setIsLoading(true);
        setTimeout(() => {
          updateChat(chatToUpdateId, (chat) => ({
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    content:
                      "AIBud was created by Andrew Brown. He is the solo founder and CEO of AIBud, and he created it as a passion project to bring the power and freedom of AI to the world for a fraction of the price.",
                  }
                : msg
            ),
          }));
          setIsLoading(false);
        }, 500);
        return;
      }

      if (mathMatch) {
        const result = calculate(mathMatch[1]);
        if (result !== null) {
          setIsLoading(true);
          setTimeout(() => {
            updateChat(chatToUpdateId, (chat) => ({
              ...chat,
              messages: chat.messages.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: `${mathMatch[1]} = ${result}` }
                  : msg
              ),
            }));
            setIsLoading(false);
          }, 500); // Simulate thinking time
          return;
        }
      }

      setIsLoading(true);
      setIsSearching(true);

      let searchResultsText = "";
      setIsSearching(false);

      abortControllerRef.current = new AbortController();

      if (apiProvider === "openai") {
        // OpenAI API Logic
        const currentChat = chats.find((c) => c.id === chatToUpdateId);
        const previousMessages = currentChat
          ? currentChat.messages.filter(
              (m) => m.role === "user" || (m.role === "assistant" && m.content)
            )
          : [];

        const messagesForAPI = [
          { role: "system", content: personalities[personality] },
          ...previousMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user", content: message },
        ];

        try {
          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${openAiApiKey}`,
              },
              signal: abortControllerRef.current.signal,
              body: JSON.stringify({
                model: openAiModel,
                messages: messagesForAPI,
                stream: true,
              }),
            }
          );

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error.message);
          }

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
              if (line.startsWith("data: ")) {
                const data = line.substring(6);
                if (data.trim() === "[DONE]") {
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    updateChat(chatToUpdateId, (chat) => ({
                      ...chat,
                      messages: chat.messages.map((msg) =>
                        msg.id === assistantMessage.id
                          ? { ...msg, content: msg.content + content }
                          : msg
                      ),
                    }));
                  }
                } catch (e) {
                  console.error("Error parsing streaming JSON", e);
                }
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
                      content: `Sorry, I encountered an error: ${error.message}`,
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
      } else {
        // Ollama API Logic
        const currentChat = chats.find((c) => c.id === chatToUpdateId);
        const allMessagesForPrompt = [
          ...(currentChat ? currentChat.messages : []),
        ];

        const conversationHistory = allMessagesForPrompt
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

        const finalPrompt = `Conversation History:\n${conversationHistory}\n\nAssistant:`;

        try {
          const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: abortControllerRef.current.signal,
            body: JSON.stringify({
              model: selectedModel,
              prompt: finalPrompt,
              system: personalities[personality],
              stream: true,
              options: {
                num_predict: 2048,
                temperature: 0.7,
                top_p: 0.9,
                top_k: 40,
                repeat_penalty: 1.1,
                seed: 42,
              },
            }),
          });

          if (!response.ok)
            throw new Error("Failed to get response from Ollama");

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
      }
    },
    [
      activeChatId,
      ollamaUrl,
      selectedModel,
      personality,
      updateChat,
      isPro,
      chats,
      apiProvider,
      openAiApiKey,
      openAiModel,
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
    <div className="flex h-screen bg-background text-text">
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
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-primary/20 text-primary">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to AIBud</h2>
              <p className="text-secondary">
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
              className="w-full max-w-md mx-auto mt-20 p-6 rounded-lg shadow-xl bg-surface"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="apiProvider"
                    className="block text-sm font-medium text-secondary"
                  >
                    API Provider
                  </label>
                  <select
                    id="apiProvider"
                    value={apiProvider}
                    onChange={(e) => setApiProvider(e.target.value)}
                    className="w-full p-2 mt-1 rounded bg-background border border-border"
                  >
                    <option value="ollama">Ollama</option>
                    <option value="openai">OpenAI</option>
                  </select>
                </div>

                {apiProvider === "ollama" && (
                  <>
                    <div>
                      <label
                        htmlFor="ollamaUrl"
                        className="block text-sm font-medium text-secondary"
                      >
                        Ollama URL
                      </label>
                      <input
                        type="text"
                        id="ollamaUrl"
                        value={ollamaUrl}
                        onChange={(e) => setOllamaUrl(e.target.value)}
                        className="w-full p-2 mt-1 rounded bg-background border border-border"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="model"
                        className="block text-sm font-medium text-secondary"
                      >
                        AI Model
                      </label>
                      <div className="flex items-center space-x-2">
                        <select
                          id="model"
                          value={selectedModel}
                          onChange={(e) => handleModelChange(e.target.value)}
                          className="flex-grow w-full p-2 mt-1 rounded bg-background border border-border"
                        >
                          {availableModels.map((model) => (
                            <option key={model.name} value={model.name}>
                              {model.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={loadModels}
                          className="p-2 mt-1 rounded-md bg-primary text-white"
                        >
                          <Zap size={18} />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {apiProvider === "openai" && (
                  <>
                    <div>
                      <label
                        htmlFor="openAiApiKey"
                        className="block text-sm font-medium text-secondary"
                      >
                        OpenAI API Key
                      </label>
                      <input
                        type="password"
                        id="openAiApiKey"
                        value={openAiApiKey}
                        onChange={(e) => setOpenAiApiKey(e.target.value)}
                        className="w-full p-2 mt-1 rounded bg-background border border-border"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="openAiModel"
                        className="block text-sm font-medium text-secondary"
                      >
                        OpenAI Model
                      </label>
                      <select
                        id="openAiModel"
                        value={openAiModel}
                        onChange={(e) => setOpenAiModel(e.target.value)}
                        className="w-full p-2 mt-1 rounded bg-background border border-border"
                      >
                        <option value="gpt-4o-mini">GPT-4o Mini</option>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label
                    htmlFor="personality"
                    className="block text-sm font-medium text-secondary"
                  >
                    AI Personality
                  </label>
                  <select
                    id="personality"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    className="w-full p-2 mt-1 rounded bg-background border border-border"
                  >
                    {Object.keys(personalities).map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-secondary">
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
                          ? "bg-primary"
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
                  <div className="p-4 bg-background rounded-lg">
                    <h3 className="font-bold text-lg text-primary">
                      Upgrade to Pro
                    </h3>
                    <p className="text-sm text-secondary mt-1">
                      Unlock unlimited messages and support the creator.
                    </p>
                    <button
                      onClick={handleUpgrade}
                      className="w-full mt-4 px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary/90"
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
                  className="px-4 py-2 rounded-md bg-primary text-white font-semibold"
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
