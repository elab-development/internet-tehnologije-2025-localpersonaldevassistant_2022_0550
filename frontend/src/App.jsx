import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/LoginPage';
import Register from './components/RegisterPage';
import Chat from './components/Chat';
import { getSavedUser, logout } from './api/auth';

export default function App() {
    const [selectedItem, setSelectedItem] = useState('');
    const [user, setUser] = useState(null);

    // Auto-login
    useEffect(() => {
        const savedUser = getSavedUser();
        if (savedUser) {
            setUser(savedUser);
        }
    }, []);

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
        setSelectedItem('WelcomePage');
    };

    const renderPage = () => {
        switch (selectedItem) {
            case 'Chat':
                return <Chat/>
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
            <Sidebar selected={selectedItem} onSelect={setSelectedItem} user={user} onLogout={handleLogout} />
            <div className='w-4/5 h-full'>
                {renderPage()}
            </div>
        </div>
    );
}
