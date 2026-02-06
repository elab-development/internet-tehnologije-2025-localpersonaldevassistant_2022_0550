import { useState, useEffect } from "react";
import { getChat, updateChat, deleteChat } from "../api/message";

export default function Chat({ chatId, onChatUpdated, onChatDeleted, isGuest, chats }) {

    const [chatData, setChatData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(chatData?.title);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [mode, setMode] = useState('default');
    const [showModeMenu, setShowModeMenu] = useState(false);
    const availableModes = [
        { id: 1, name: 'default', title: 'Default', icon: './default_mode.png' },
        { id: 2, name: 'bug_fixer', title: 'Bug fixer', icon: './bug_fixer.png' },
        { id: 3, name: 'code_reviewer', title: 'Code reviewer', icon: './code_reviewer.png' },
        { id: 4, name: 'python_tutor', title: 'Python tutor', icon: './python_tutor.png' },
    ]

    const getChatByID = async () => {

        if (isGuest) {
            const localChat = chats.find(c => c.id === chatId);
            if (localChat) {
                setChatData(localChat);
                setNewTitle(localChat.title);
            }
            return;
        }

        try {
            const chat = await getChat(chatId);
            setChatData(chat);
            setNewTitle(chat.title);
            console.log(chat);
        } catch (error) {
            console.log(error);
        }
    }

    const handleUpdateTitle = async () => {

        if (isGuest) {
            const updatedChat = { ...chatData, title: newTitle, updated_at: new Date().toISOString() };
            setChatData(updatedChat);
            setIsEditing(false);
            onChatUpdated(updatedChat);
            return;
        }

        try {
            const updatedChat = await updateChat(chatId, newTitle);
            setChatData(updatedChat);
            setIsEditing(false);

            if (onChatUpdated) {
                onChatUpdated(updatedChat);
            }
        } catch (error) { console.log(error); }
    }

    const handleDelete = async () => {

        if (isGuest) {
            onChatDeleted(chatId);
            setShowDeleteModal(false);
            return;
        }

        try {
            await deleteChat(chatId);
            if (onChatDeleted) {
                onChatDeleted(chatId);
            }
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Greška pri brisanju chata:", error);
        }
    };

    useEffect(() => {
        if (chatId) {
            getChatByID();
            setIsEditing(false);
        }
    }, [chatId, chats]);

    return (
        <>
            <div className="w-full h-full flex flex-col">
                <div className="w-full h-20 flex items-center justify-between pl-5 pr-5">
                    <div className="flex items-center justify-baseline gap-2 h-full">
                        {isEditing ? (
                            <input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                                autoFocus
                                className="bg-zinc-700 text-white text-2xl font-bold p-1 rounded outline-none pl-3 pr-3"
                            />
                        ) : (
                            <h2 className="font-bold text-2xl text-white">{chatData?.title}</h2>
                        )}
                        <div onClick={() => isEditing ? handleUpdateTitle() : setIsEditing(true)}
                            className="flex justify-center items-center w-12 h-12 rounded-4xl bg-zinc-600 cursor-pointer hover:opacity-50 duration-200">
                            <img className="w-5" src="./edit.png" alt="edit" />
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 h-full w-1/5">
                        <div onClick={() => setShowDeleteModal(true)} className="flex justify-center items-center w-12 h-12 rounded-4xl bg-zinc-600 cursor-pointer hover:opacity-50 duration-200">
                            <img className="w-5" src="./delete.png" alt="delete" />
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex justify-center items-center w-full h-4/5 bg-zinc-600">
                    <h1 className="text-4xl text-white font-black">{chatId}</h1>
                </div>


                <div className="w-full h-20 flex items-center justify-center">
                    <div className="w-4/5 h-full flex items-center justify-center gap-5">
                        {!isGuest &&
                            <div className="w-15 h-15 bg-zinc-600 rounded-4xl flex justify-center items-center cursor-pointer hover:bg-zinc-700 duration-200">
                                <img className="w-7" src="./doc.png" alt="document" />
                            </div>}
                        <input placeholder="Enter a message..." className="w-4/5 h-15 rounded-2xl bg-zinc-600 pl-3 pr-3 text-white text-lg outline-0" type="text" />
                        {!isGuest && (
                            <div className="relative">
                                {showModeMenu && (
                                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-zinc-800 border border-zinc-700 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                        <p className="text-zinc-500 text-xs font-bold px-3 py-1 uppercase">Select Mode</p>
                                        {availableModes.map((m) => (
                                            <div
                                                key={m.id}
                                                onClick={() => {
                                                    setMode(m.name);
                                                    setShowModeMenu(false);
                                                }}
                                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer duration-200 ${mode === m.name ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                                            >
                                                <img className="w-5" src={m.icon} alt="" />
                                                <span className="text-sm font-medium">{m.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div
                                    onClick={() => setShowModeMenu(!showModeMenu)}
                                    className={`w-15 h-15 rounded-4xl flex justify-center items-center cursor-pointer duration-200 ${showModeMenu ? 'bg-zinc-500 shadow-inner' : 'bg-zinc-600 hover:bg-zinc-700'}`}
                                >
                                    <img className="w-8" src="./mode.png" alt="mode" />
                                </div>
                            </div>
                        )}
                        <div className="w-15 h-15 bg-zinc-600 rounded-4xl flex justify-center items-center cursor-pointer hover:bg-zinc-700 duration-200">
                            <img className="w-6" src="./send.png" alt="send" />
                        </div>
                    </div>
                </div>
            </div>
            {/* Custom Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-2xl shadow-2xl w-96 flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-white">Delete Chat</h2>
                        <p className="text-zinc-400">Are you sure you want to delete this chat? This action cannot be undone.</p>

                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>

    );

}