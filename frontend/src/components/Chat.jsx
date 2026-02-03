import { useState, useEffect } from "react";
import { getChat, updateChat } from "../api/message";

export default function Chat({ chatId, onChatUpdated }) {

    const [chatData, setChatData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(chatData?.title);

    const getChatByID = async () => {
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
        try {
            const updatedChat = await updateChat(chatId, newTitle);
            setChatData(updatedChat);
            setIsEditing(false);

            if (onChatUpdated) {
                onChatUpdated(updatedChat);
            }
        } catch (error) { console.log(error); }
    }

    useEffect(() => {
        if (chatId) {
            getChatByID();
            setIsEditing(false);
        }
    }, [chatId]);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="w-full h-20 flex items-center justify-between pl-5 pr-5">
                <div className="flex items-center justify-baseline gap-2 h-full">
                    {isEditing ? (
                        <input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                            autoFocus
                            className="bg-zinc-700 text-white text-2xl font-bold p-1 rounded outline-none"
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
                    <div className="flex justify-center items-center w-12 h-12 rounded-4xl bg-zinc-600 cursor-pointer hover:opacity-50 duration-200">
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
                    <div className="w-15 h-15 bg-zinc-600 rounded-4xl flex justify-center items-center cursor-pointer hover:bg-zinc-700 duration-200">
                        <img className="w-7" src="./doc.png" alt="document" />
                    </div>
                    <input placeholder="Enter a message..." className="w-4/5 h-15 rounded-2xl bg-zinc-600 pl-3 pr-3 text-white text-lg outline-0" type="text" />
                    <div className="w-15 h-15 bg-zinc-600 rounded-4xl flex justify-center items-center cursor-pointer hover:bg-zinc-700 duration-200">
                        <img className="w-8" src="./mode.png" alt="send" />
                    </div>
                    <div className="w-15 h-15 bg-zinc-600 rounded-4xl flex justify-center items-center cursor-pointer hover:bg-zinc-700 duration-200">
                        <img className="w-6" src="./send.png" alt="send" />
                    </div>
                </div>
            </div>
        </div>
    );

}