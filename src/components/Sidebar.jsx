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
  MoreHorizontal,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const ChatMenu = ({ chat, onRename, onDelete, onClose, triggerRef }) => {
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, triggerRef]);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute right-0 top-full mt-1 w-32 bg-surface rounded-md shadow-lg z-10 border border-background"
    >
      <button
        onClick={() => {
          onRename(chat.id, chat.title);
          onClose();
        }}
        className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-background"
      >
        <Edit3 size={14} className="mr-2" />
        Rename
      </button>
      <button
        onClick={() => {
          onDelete(chat.id);
          onClose();
        }}
        className="flex items-center w-full px-3 py-2 text-sm text-left text-red-500 hover:bg-background"
      >
        <Trash2 size={14} className="mr-2" />
        Delete
      </button>
    </motion.div>
  );
};

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
    isPro,
  }) => {
    const [editingChatId, setEditingChatId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [openMenuChatId, setOpenMenuChatId] = useState(null);
    const menuTriggerRefs = React.useRef({});

    const handleRenameStart = (chatId, currentTitle) => {
      setEditingChatId(chatId);
      setEditingTitle(currentTitle);
      setOpenMenuChatId(null);
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

    const toggleMenu = (chatId) => {
      setOpenMenuChatId((prev) => (prev === chatId ? null : chatId));
    };

    const closeMenu = () => {
      setOpenMenuChatId(null);
    };

    return (
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`h-full flex flex-col ${
          isCollapsed ? "w-20" : "w-80"
        } bg-surface p-3 transition-colors duration-300`}
      >
        <div
          className={`flex items-center mb-4 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <h1 className="text-2xl font-bold text-primary">AIBud</h1>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-background"
          >
            {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
          </button>
        </div>

        <button
          onClick={onNewChat}
          className={`flex items-center justify-center w-full p-3 rounded-lg text-lg font-semibold mb-4 transition-all duration-200 ${
            isCollapsed ? "" : "justify-start"
          } bg-primary text-white hover:bg-blue-700`}
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
            {chats.map((chat) => {
              // Ensure a ref is created for each menu trigger
              if (!menuTriggerRefs.current[chat.id]) {
                menuTriggerRefs.current[chat.id] = React.createRef();
              }

              return (
                <motion.div
                  key={chat.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`group flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 relative ${
                    activeChatId === chat.id
                      ? "bg-primary/20"
                      : "hover:bg-background"
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
                            onBlur={handleRenameConfirm}
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
                  {!isCollapsed && !editingChatId && (
                    <div className="flex items-center ml-2">
                      <button
                        ref={menuTriggerRefs.current[chat.id]}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(chat.id);
                        }}
                        className="p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-background"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openMenuChatId === chat.id && (
                        <ChatMenu
                          chat={chat}
                          onRename={() =>
                            handleRenameStart(chat.id, chat.title)
                          }
                          onDelete={() => onDeleteChat(chat.id)}
                          onClose={closeMenu}
                          triggerRef={menuTriggerRefs.current[chat.id]}
                        />
                      )}
                    </div>
                  )}
                  {!isCollapsed && editingChatId === chat.id && (
                    <div className="flex items-center ml-2">
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
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className={`pt-3 border-t border-background`}>
          {!isCollapsed && !isPro && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-2 pb-2 text-center"
            >
              <p className="text-xs text-secondary">
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
              className="p-2 rounded-md hover:bg-background"
            >
              {isDarkMode ? <Sun /> : <Moon />}
            </button>
            <button
              onClick={onShowSettings}
              className="p-2 rounded-md hover:bg-background"
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
