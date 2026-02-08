import { useState } from 'react';
import AdminUsers from './AdminUsers';
import AdminConfig from './AdminConfig';

export default function AdminPanel({ onBackToChats }) {
    const [activeTab, setActiveTab] = useState('users');

    const tabs = [
        
        
        { id: 'users', label: ' Users', icon:'./multi-user.png', component: AdminUsers },
        { id: 'config', label: ' Config',icon:'./settings.png', component: AdminConfig },
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

    return (
        <div className="flex flex-col w-full h-full bg-neutral-800">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                <h1 className="text-3xl font-bold text-white">
                     Admin Panel
                </h1>
                {/* Back button */}
                <button
                    onClick={onBackToChats}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg transition-all duration-200 cursor-pointer"
                >
                    <span>←</span>
                    <span>Back to Chats</span>
                </button>
                
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 px-6 pt-4 border-b border-zinc-700">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold rounded-t-lg transition-all duration-200 cursor-pointer ${
                            activeTab === tab.id
                                ? 'bg-red-600 text-white'
                                : 'bg-zinc-700 text-gray-400 hover:bg-zinc-600 hover:text-white'
                        }`}

                    >
                
                     <img 
                        src={tab.icon} 
                        alt={tab.label} 
                        className="w-5 h-5"
                    />
               
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                 {ActiveComponent ? <ActiveComponent /> : <div className="text-white">Loading...</div>}

            </div>
        </div>
    );
}
