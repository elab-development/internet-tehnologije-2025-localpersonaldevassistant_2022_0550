import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/LoginPage';
import Register from './components/RegisterPage';
import Chat from './components/Chat';
import { getSavedUser, logout } from './api/auth';
import { getChats } from './api/message';

export default function App() {
    const [selectedItem, setSelectedItem] = useState('');
    const [user, setUser] = useState(null);
    const [activeChatID, setActiveChatID] = useState(null);
    const [chats, setChats] = useState([]);

    const fetchChats = async () => {
        try {
            const data = await getChats();
            setChats(data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        if (user) fetchChats();
    }, [user]);

    // Login handler
    const handleLogin = (userData) => {
        setUser(userData);
        setSelectedItem('WelcomePage');
    };

    // Register handler
    const handleRegister = (userData) => {
        setUser(userData);
        setSelectedItem('WelcomePage');
    };

    // Logout handler
    const handleLogout = () => {
        logout();
        setUser(null);
        setActiveChatID(null);
        setSelectedItem('WelcomePage');
    };

    const handleChatUpdated = (updatedChat) => {
        setChats(prevChats =>
            prevChats.map(c => c.id === updatedChat.id ? updatedChat : c)
        );
    };

    const renderPage = () => {

        if (user && activeChatID) {
            return <Chat chatId={activeChatID} onChatUpdated={handleChatUpdated} />
        }

        switch (selectedItem) {
            case 'Login':
                return <Login onLogin={handleLogin} onSwitchToRegister={() => setSelectedItem('Register')} />
            case 'Register':
                return <Register onRegister={handleRegister} onSwitchToLogin={() => setSelectedItem('Login')} />
            case 'WelcomePage':
                return <div className="w-full h-full flex justify-center items-center font-bold text-3xl text-white">Welcome to Local Personal Dev Assistant</div>;
        }
    }

    return (
        <div className='flex w-screen h-screen bg-zinc-800'>
            <Sidebar
                user={user}
                chats={chats}
                setChats={setChats}
                onChatSelect={setActiveChatID}
                activeChatID={activeChatID}
                onLogout={handleLogout}
                onSelect={setSelectedItem}
            />
            <div className='w-4/5 h-full'>
                {renderPage()}
            </div>
        </div>
    );
}
