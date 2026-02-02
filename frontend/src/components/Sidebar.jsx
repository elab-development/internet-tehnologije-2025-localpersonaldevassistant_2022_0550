import { useState } from "react";


export default function Sidebar({ onSelect, selected, user, onLogout }) {

    const navs = [
        { title: 'Copilot chat', image: '/logo.png' },
        { title: 'Pomodoro', image: '/pomodoro.png' },
        { title: 'Generate quiz', image: '/quiz.png' },
    ]

    const chats = [];

    return (
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
                            <div onClick={() => onSelect('Login')} className="flex items-center justify-center gap-2 bg-zinc-600 p-3 rounded-lg cursor-pointer hover:bg-zinc-700 duration-200">
                                <img className="w-5" src="./login.png" alt="login" />
                                <p className="font-medium text-xl">Login</p>
                            </div>
                            <div onClick={() => onSelect('Register')} className="flex items-center justify-center gap-2 bg-zinc-600 p-3 rounded-lg cursor-pointer hover:bg-zinc-700 duration-200">
                                <img className="w-5" src="./signup.png" alt="login" />
                                <p className="font-medium text-xl">Signup</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* New chat */}
            <div className="flex w-full h-20 p-3">
                <div onClick={() => onSelect('Chat')} className="w-full h-full flex gap-3 items-center bg-zinc-600 p-3 rounded-lg cursor-pointer hover:bg-zinc-700 duration-200">
                    <img className="w-7" src="./newchat.png" alt="newchat" />
                    <h2>New chat</h2>
                </div>
            </div>

            {/* Chat history */}
            <div className="flex flex-col pl-3">
                <div className="flex items-center gap-3 w-full h-15 mb-3">
                    <img className="w-7" src="./chat-history.png" alt="chat-history" />
                    <h2>Chat history</h2>
                </div>
                {chats.length === 0 ? (
                    <p className="font-normal text-xl opacity-50">Chat history is empty.</p>
                ) : (
                    <div></div>
                )}
            </div>
        </aside>
    );

}