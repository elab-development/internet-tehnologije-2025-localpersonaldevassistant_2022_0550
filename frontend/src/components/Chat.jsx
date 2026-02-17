import { useState, useEffect, useRef } from "react";
import { getChat, updateChat, deleteChat, getModes, sendMessage, sendAnonymousMessage } from "../api/message";


export default function Chat({ chatId, onChatUpdated, onChatDeleted, isGuest, chats, onSelect, onChatSelect }) {
    const [chatData, setChatData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [guestMessageCount, setGuestMessageCount] = useState(0);

    const [modes, setModes] = useState([]);
    const [selectedMode, setSelectedMode] = useState(null);
    const [showModeMenu, setShowModeMenu] = useState(false);

    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [showMessageLimitModal, setShowMessageLimitModal] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "0px";
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = scrollHeight + "px";
        }
    }, [inputValue]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setSelectedFile(file);
        } else {
            alert("Please select a PDF file.");
        }
        e.target.value = null;
    };

    const removeFile = () => {
        setSelectedFile(null);
    };

    const modeConfig = {
        'default': { title: 'Default', icon: './default_mode.png' },
        'bug_fixer': { title: 'Bug Fixer', icon: './bug_fixer.png' },
        'code_reviewer': { title: 'Code Reviewer', icon: './code_reviewer.png' },
        'python_tutor': { title: 'Python Tutor', icon: './python_tutor.png' },
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    useEffect(() => {
        if (isGuest && chatId) {
            const savedMessages = localStorage.getItem(`guest_messages_${chatId}`);
            if (savedMessages) {
                try {
                    setMessages(JSON.parse(savedMessages));
                } catch (error) {
                    console.error('Error loading guest messages:', error);
                }
            }
        }
    }, [chatId, isGuest]);

    useEffect(() => {
        if (isGuest && chatId) {
            const savedCount = localStorage.getItem(`guest_message_count_${chatId}`);
            if (savedCount) {
                setGuestMessageCount(parseInt(savedCount, 10));
            } else {
                setGuestMessageCount(0);
            }
        }
    }, [chatId, isGuest]);


    useEffect(() => {
        if (isGuest && chatId && messages.length > 0) {
            localStorage.setItem(`guest_messages_${chatId}`, JSON.stringify(messages));
        }
    }, [messages, chatId, isGuest]);


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadInitialData = async () => {
        try {
            if (isGuest) {
                const defaultMode = { id: 1, name: 'default', description: 'You are a helpful AI assistant.' };
                setModes([defaultMode]);
                setSelectedMode(defaultMode);

                const localChat = chats.find(c => c.id === chatId);
                if (localChat) {
                    setChatData(localChat);
                    setNewTitle(localChat.title);


                    const savedMessages = localStorage.getItem(`guest_messages_${chatId}`);
                    if (savedMessages) {
                        try {
                            setMessages(JSON.parse(savedMessages));
                        } catch (error) {
                            console.error('Error loading messages:', error);
                            setMessages([]);
                        }
                    } else {
                        setMessages([]);
                    }
                }
            } else {
                const dbModes = await getModes();
                setModes(dbModes);
                if (dbModes.length > 0) setSelectedMode(dbModes[0]);

                const chat = await getChat(chatId);
                setChatData(chat);
                setNewTitle(chat.title);
                setMessages(chat.messages || []);
            }
        } catch (error) {
            console.error("Greška pri učitavanju:", error);
        }
    };


    useEffect(() => {
        if (chatId) {
            loadInitialData();
            setIsEditing(false);
        }
    }, [chatId, chats]);

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
            if (onChatUpdated) onChatUpdated(updatedChat);
        } catch (error) { console.log(error); }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        if (isGuest && guestMessageCount >= 10) {
            setShowMessageLimitModal(true);
            return;
        }

        const currentInput = inputValue;
        const currentFile = selectedFile;

        setInputValue("");
        setSelectedFile(null);

        const tempUserMsg = {
            role: "user",
            content: currentInput,
            documents: currentFile ? [{ title: currentFile.name }] : []
        };

        setMessages(prev => [...prev, tempUserMsg]);
        setIsLoading(true);

        try {
            let aiMsg;

            if (isGuest) {
                const response = await sendAnonymousMessage(currentInput, 1);
                aiMsg = {
                    role: "assistant",
                    content: response.content,
                    documents: []
                };

                const newCount = guestMessageCount + 1;
                setGuestMessageCount(newCount);
                localStorage.setItem(`guest_message_count_${chatId}`, newCount.toString());
            } else {
                aiMsg = await sendMessage(
                    chatId,
                    currentInput,
                    selectedMode?.id || 1,
                    currentFile
                );
            }

            setMessages(prev => [...prev, aiMsg]);

            const updatedChat = {
                ...chatData,
                updated_at: new Date().toISOString()
            };
            setChatData(updatedChat);

            if (onChatUpdated) {
                onChatUpdated(updatedChat);
            }

        } catch (error) {
            console.error("Slanje poruke neuspešno:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleDelete = async () => {
        if (isGuest) {
            onChatDeleted(chatId);
            setShowDeleteModal(false);
            localStorage.removeItem(`guest_messages_${chatId}`);
            localStorage.removeItem(`guest_message_count_${chatId}`);
            return;
        }
        try {
            await deleteChat(chatId);
            if (onChatDeleted) onChatDeleted(chatId);
            setShowDeleteModal(false);
        } catch (error) { console.error(error); }
    };

    return (
        <>
            <div className="w-full h-full flex flex-col bg-zinc-900">
                {/* HEADER */}
                <div className="w-full h-20 flex items-center justify-between pl-5 pr-5 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                                autoFocus
                                className="bg-zinc-700 text-white text-2xl font-bold p-1 rounded outline-none px-3"
                            />
                        ) : (
                            <h2 className="font-bold text-2xl text-white">{chatData?.title}</h2>
                        )}
                        <div onClick={() => isEditing ? handleUpdateTitle() : setIsEditing(true)}
                            className="flex justify-center items-center w-10 h-10 rounded-full bg-zinc-800 cursor-pointer hover:bg-zinc-700 duration-200">
                            <img className="w-4" src="./edit.png" alt="edit" />
                        </div>
                    </div>
                    <div onClick={() => setShowDeleteModal(true)} className="flex justify-center items-center w-10 h-10 rounded-full bg-zinc-800 cursor-pointer hover:bg-red-900/30 duration-200">
                        <img className="w-4" src="./delete.png" alt="delete" />
                    </div>
                </div>

                {/* MESSAGES AREA */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                    {messages.length === 0 && !isLoading && (
                        <div className="h-full flex items-center justify-center text-zinc-500">
                            Start conversation...
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            {msg.role === 'user' && msg.documents && msg.documents.length > 0 && (
                                <div className="flex items-center gap-2 mb-1 bg-blue-700/40 p-2 px-3 rounded-lg border border-blue-400/30 text-xs text-blue-100">
                                    <img className="w-3" src="./pdf.png" alt="pdf" />
                                    <span>{msg.documents[0].title}</span>
                                </div>
                            )}
                            <div className={`max-w-[75%] p-4 rounded-2xl text-white shadow-sm ${msg.role === 'user' ? 'bg-blue-600 rounded-tr-none' : 'bg-zinc-800 rounded-tl-none border border-zinc-700'
                                }`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-2xl rounded-tl-none animate-pulse text-zinc-400">
                                typing...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* INPUT AREA */}
                <div className="w-full p-5 bg-zinc-900 border-t border-zinc-800">
                    <div className="max-w-4xl mx-auto">

                        {selectedFile && (
                            <div className="flex items-center gap-2 mb-3 bg-zinc-800 w-fit p-2 px-4 rounded-xl border border-blue-500/30">
                                <img className="w-4" src="./pdf.png" alt="pdf" />
                                <span className="text-zinc-300 text-sm truncate max-w-\[200px\]">{selectedFile.name}</span>
                                <button
                                    onClick={removeFile}
                                    className="ml-2 text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <div className="flex items-end gap-4">
                            {!isGuest && (
                                <>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".pdf"
                                        className="hidden"
                                    />

                                    <div
                                        onClick={() => !selectedFile && fileInputRef.current.click()}
                                        className={`w-15 h-15 rounded-full flex justify-center items-center shrink-0 duration-200 ${selectedFile
                                            ? 'bg-zinc-800 opacity-50 cursor-not-allowed'
                                            : 'bg-zinc-800 cursor-pointer hover:bg-zinc-700'
                                            }`}
                                    >
                                        <img className="w-6" src="./doc.png" alt="doc" />
                                    </div>
                                </>
                            )}

                            <div className="relative flex-1 flex items-end gap-2 bg-zinc-800 rounded-2xl border border-transparent focus-within:ring-2 focus-within:ring-blue-500/50">
                                <textarea
                                    ref={textareaRef}
                                    rows="1"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Ask something..."
                                    className="w-full max-h-40 py-4 pl-5 pr-5 bg-transparent text-white text-lg outline-none resize-none custom-scrollbar"
                                />

                                {!isGuest && (
                                    <div className="pb-2 pr-2 shrink-0">
                                        <div className="relative">
                                            {showModeMenu && (
                                                <div className="absolute bottom-full mb-4 right-0 w-56 bg-zinc-800 border border-zinc-700 rounded-2xl shadow-2xl p-2 z-50">
                                                    <p className="text-zinc-500 text-[10px] font-bold px-3 py-2 uppercase tracking-wider">Active modes</p>
                                                    {modes.map((m) => (
                                                        <div key={m.id} onClick={() => { setSelectedMode(m); setShowModeMenu(false); }}
                                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer duration-200 ${selectedMode?.id === m.id ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}>
                                                            <img className="w-5 h-5" src={modeConfig[m.name]?.icon || './default_mode.png'} alt="" />
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-sm font-bold">{modeConfig[m.name]?.title || m.name}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div onClick={() => setShowModeMenu(!showModeMenu)}
                                                className={`w-10 h-10 rounded-full flex justify-center items-center cursor-pointer duration-200 ${showModeMenu ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}>
                                                <img className="w-6" src={modeConfig[selectedMode?.name]?.icon || './mode.png'} alt="mode" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SEND BUTTON */}
                            <div
                                onClick={handleSend}
                                className={`w-13 h-13 rounded-full flex justify-center items-center cursor-pointer duration-200 shrink-0 mb-1 ${isLoading ? 'bg-zinc-700' : 'bg-blue-600 hover:bg-blue-500'
                                    }`}
                            >
                                <img className={`w-6 ${isLoading ? 'opacity-20' : ''}`} src="./send.png" alt="send" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-\[100]\ flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-2xl shadow-2xl w-96">
                        <h2 className="text-xl font-bold text-white mb-2">Delete Chat</h2>
                        <p className="text-zinc-400 mb-6">Are you sure? Messages will be permanently deleted!</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 cursor-pointer">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            {/* MESSAGE LIMIT MODAL */}
            {showMessageLimitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4 border border-zinc-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 flex items-center justify-center shrink-0">
                                <img
                                    src="./crisis.png"
                                    alt="Warning"
                                    className="w-7 h-7"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                Message Limit Reached
                            </h3>
                        </div>

                        <p className="text-zinc-400 mb-6">
                            Guest users are limited to <span className="text-yellow-400 font-bold">10 messages</span>.
                            Please login or register to ask more questions!
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowMessageLimitModal(false);
                                    onSelect('Login');
                                    onChatSelect(null);
                                }}
                                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer font-bold"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => {
                                    setShowMessageLimitModal(false);
                                    onSelect('Register');
                                    onChatSelect(null);
                                }}
                                className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 cursor-pointer font-bold"
                            >
                                Register
                            </button>
                            <button
                                onClick={() => setShowMessageLimitModal(false)}
                                className="px-4 py-2 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )

            }
        </>

    );
}