import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/LoginPage';
import Register from './components/RegisterPage';
import Chat from './components/Chat';
import { getSavedUser, logout } from './api/auth';
import { getChats } from './api/message';
import AdminPanel from './components/AdminPanel';

export default function App() {
    const [selectedItem, setSelectedItem] = useState('');
    const [user, setUser] = useState(null);
    const [activeChatID, setActiveChatID] = useState(null);
    const [chats, setChats] = useState([]);
    const [activeView, setActiveView] = useState('chat');

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
        setChats([]);
        setSelectedItem('WelcomePage');
    };

    const handleChatUpdated = (updatedChat) => {
        setChats(prevChats =>
            prevChats.map(c => c.id === updatedChat.id ? updatedChat : c)

        );
    };

    const handleChatDeleted = (deletedChatId) => {
        setChats(prevChats => prevChats.filter(chat => chat.id !== deletedChatId));
        setActiveChatID(null);
        setSelectedItem('WelcomePage');
    };

    const renderPage = () => {

        // Ako je admin view aktivan i korisnik je admin
        if (user && activeView === 'admin' && user.role_id === 'admin') {
            return <AdminPanel onBackToChats={() => setActiveView('chat')} />
        }


        if (activeChatID) {
            return <Chat chatId={activeChatID} onChatUpdated={handleChatUpdated} onChatDeleted={handleChatDeleted} isGuest={!user} chats={chats} />
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
                activeView={activeView}
                onViewChange={setActiveView}
            />
            <div className='w-4/5 h-full'>
                {renderPage()}
            </div>
        </div>
    );
}
