import { useState, useEffect } from "react";
import { createChat, getChats } from "../api/message";

export default function Sidebar({
    user,
    chats,
    setChats,
    onChatSelect,
    activeChatID,
    onLogout,
    onSelect,
    onViewChange,
    activeView,
    
}) {

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showChatLimitModal, setShowChatLimitModal] = useState(false);


   const handleCreateChat = async () => {
    setError('');

    if (!user) {
        const guestChats = chats.filter(chat => String(chat.id).startsWith('guest_'));
        
        
        if (guestChats.length >= 1) {
            setShowChatLimitModal(true);
            return;
        }
        
        const now = new Date().toISOString();
        const guestChat = {
            id: `guest_${Date.now()}`,
            title: "New chat",
            created_at: now,
            updated_at: now
        };
        setChats(prev => [guestChat, ...prev]);
        onChatSelect(guestChat.id);
        onViewChange('chat');
        return;
    }

    setLoading(true);
    try {
        const chat = await createChat();
        console.log(chat);
        setChats(prevChats => [chat, ...prevChats]);
        onChatSelect(chat.id);
        onViewChange('chat');
    } catch (error) {
        console.error(error);
        setError("Neuspešno kreiranje chata");
    } finally {
        setLoading(false);
    }
    }



    return (
        <>
        <aside className="flex flex-col text-left w-1/5 h-full font-bold text-white text-2xl bg-neutral-900 border-r">
            {/* Profile */}
            <div className="w-full h-35 p-3 border-b">
                {user ? (
                    <div className="flex-col">
                        <p className="text-2xl">{user.full_name}</p>
                        <p className="text-lg font-normal opacity-50">{user.email}</p>
                        <div onClick={onLogout} className="mt-3 w-3/4 flex gap-1 items-center justify-center p-2 rounded-lg bg-zinc-600 cursor-pointer hover:bg-zinc-700 duration-200">
                            <img className="w-5" src="./logout.png" alt="logout" />
                            <p className="text-base">Logout</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full w-full">
                        <div className="flex items-center gap-3 w-full h-1/2">
                            <img className="w-7" src="./guest.png" alt="guest" />
                            <h3>Guest</h3>
                        </div>
                        <div className="flex justify-between items-center w-full h-1/2">
                            <div onClick={() => { onChatSelect(null); onSelect('Login') }} className="flex items-center justify-center gap-2 bg-zinc-600 p-3 rounded-lg cursor-pointer hover:bg-zinc-700 duration-200">
                                <img className="w-5" src="./login.png" alt="login" />
                                <p className="font-medium text-xl">Login</p>
                            </div>
                            <div onClick={() => { onChatSelect(null); onSelect('Register') }} className="flex items-center justify-center gap-2 bg-zinc-600 p-3 rounded-lg cursor-pointer hover:bg-zinc-700 duration-200">
                                <img className="w-5" src="./signup.png" alt="login" />
                                <p className="font-medium text-xl">Signup</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            
            


            {/* New chat */}
            <div className="flex w-full h-20 p-3">
                <div onClick={!loading ? handleCreateChat : undefined} className={`w-full h-full flex gap-3 items-center bg-zinc-600 p-3 rounded-lg cursor-pointer hover:bg-zinc-700 duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <img className="w-7" src="./newchat.png" alt="newchat" />
                    <h2 className="text-xl">{loading ? 'Creating chat...' : 'New chat'}</h2>
                </div>
            </div>


            {/* Chat history */}
            {(user || chats.length > 0) && (
                <div className="flex flex-col pl-3 pr-3 overflow-hidden pb-3">
                    <div className="flex items-center gap-3 w-full h-15 mb-1">
                        <img className="w-7" src="./chat-history.png" alt="chat-history" />
                        <h2>Chat history</h2>
                    </div>
                    {chats.length === 0 ? (
                        <p className="font-normal text-xl opacity-50">Chat history is empty.</p>
                    ) : (
                        <div className="w-full flex flex-col gap-2 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                            {chats.map(chat => {
                                const isActive = chat.id === activeChatID;

                                return (
                                    <div key={chat.id} onClick={() => { onChatSelect(chat.id); onViewChange('chat') }}
                                        className={`flex items-center justify-baseline w-full text-lg p-3 rounded-xl cursor-pointer ${isActive ? 'bg-zinc-600' : 'bg-zinc-800 hover:bg-zinc-700 duration-200'}`}>
                                        {chat.title.length > 25
                                            ? chat.title.slice(0, 25) + "..."
                                            : chat.title}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>


            )}

            {user && user.role_id === 'admin' && (
                <>
                    {/* Divider */}
                    <div className="w-full h-px bg-zinc-700 mt-auto mb-3 mx-3"></div>

                    {/* Admin Panel Button */}
                    <div className="flex w-full px-3 pb-3">
                        <div
                            onClick={() => onViewChange('admin')}
                            className={`w-full flex gap-3 items-center p-3 rounded-lg cursor-pointer duration-200 ${activeView === 'admin'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-zinc-600 hover:bg-zinc-700'
                                }`}
                        >
                            <img className="w-6" src="./settings.png" alt="admin" />
                            <h2 className="text-xl">Admin Panel</h2>
                        </div>
                    </div>
                </>
            )}

        </aside>
        {showChatLimitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4 border border-zinc-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                <img 
                                    src="./crisis.png" 
                                    alt="Warning" 
                                    className="w-7 h-7"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                Chat Limit Reached
                            </h3>
                        </div>
                        
                        <p className="text-zinc-400 mb-6">
                            Guest users are limited to <span className="text-yellow-400 font-bold">1 chat</span>. 
                            Please login or register to create more chats!
                        </p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setShowChatLimitModal(false);
                                    onSelect('Login');
                                    onChatSelect(null);
                                }} 
                                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer font-bold"
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => {
                                    setShowChatLimitModal(false);
                                    onSelect('Register');
                                    onChatSelect(null);
                                }} 
                                className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 cursor-pointer font-bold"
                            >
                                Register
                            </button>
                            <button 
                                onClick={() => setShowChatLimitModal(false)} 
                                className="px-4 py-2 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
      </>  
    );

}