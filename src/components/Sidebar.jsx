import React, { useState } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  MessageSquarePlus,
  Trash2,
  Edit3,
  Check,
  X,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const Sidebar = React.memo(
  ({
    chats,
    activeChatId,
    onNewChat,
    onSwitchChat,
    onRenameChat,
    onDeleteChat,
    isCollapsed,
    onToggle,
    isDarkMode,
    onToggleTheme,
    onShowSettings,
    chatUsage,
  }) => {
    const [editingChatId, setEditingChatId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    const handleRenameStart = (chatId, currentTitle) => {
      setEditingChatId(chatId);
      setEditingTitle(currentTitle);
    };

    const handleRenameConfirm = () => {
      if (editingChatId && editingTitle.trim()) {
        onRenameChat(editingChatId, editingTitle.trim());
      }
      setEditingChatId(null);
      setEditingTitle("");
    };

    const handleRenameCancel = () => {
      setEditingChatId(null);
      setEditingTitle("");
    };

    return (
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`h-full flex flex-col ${
          isCollapsed ? "w-20" : "w-80"
        } bg-light-surface dark:bg-dark-surface p-3 transition-colors duration-300`}
      >
        <div
          className={`flex items-center mb-4 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <h1 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
              AIBud
            </h1>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-light-background dark:hover:bg-dark-background"
          >
            {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
          </button>
        </div>

        <button
          onClick={onNewChat}
          className={`flex items-center justify-center w-full p-3 rounded-lg text-lg font-semibold mb-4 transition-all duration-200 ${
            isCollapsed ? "" : "justify-start"
          } bg-light-primary text-white hover:bg-blue-700`}
        >
          <MessageSquarePlus className={isCollapsed ? "" : "mr-3"} />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              New Chat
            </motion.span>
          )}
        </button>

        <div className="flex-1 overflow-y-auto pr-1">
          <AnimatePresence>
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
                  activeChatId === chat.id
                    ? "bg-light-primary/20 dark:bg-dark-primary/20"
                    : "hover:bg-light-background dark:hover:bg-dark-background"
                }`}
                onClick={() => !editingChatId && onSwitchChat(chat.id)}
              >
                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden">
                    {editingChatId === chat.id ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameConfirm();
                            if (e.key === "Escape") handleRenameCancel();
                          }}
                          autoFocus
                          className="w-full bg-transparent text-sm focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-medium truncate">
                        {chat.title}
                      </span>
                    )}
                  </div>
                )}
                {!isCollapsed && (
                  <div className="flex items-center ml-2">
                    {editingChatId === chat.id ? (
                      <>
                        <button
                          onClick={handleRenameConfirm}
                          className="p-1 hover:text-green-500"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleRenameCancel}
                          className="p-1 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameStart(chat.id, chat.title);
                          }}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:text-light-primary"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div
          className={`pt-3 border-t border-light-background dark:border-dark-background`}
        >
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-2 pb-2 text-center"
            >
              <p className="text-xs text-light-secondary dark:text-dark-secondary">
                {Math.max(0, 100 - chatUsage.count)} messages remaining this
                month.
              </p>
            </motion.div>
          )}
          <div
            className={`flex ${
              isCollapsed ? "flex-col space-y-2" : "flex-row justify-around"
            } items-center`}
          >
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-md hover:bg-light-background dark:hover:bg-dark-background"
            >
              {isDarkMode ? <Sun /> : <Moon />}
            </button>
            <button
              onClick={onShowSettings}
              className="p-2 rounded-md hover:bg-light-background dark:hover:bg-dark-background"
            >
              <Settings />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
);

export default Sidebar;
