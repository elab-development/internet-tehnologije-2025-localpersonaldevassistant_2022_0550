import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/LoginPage';
import Register from './components/RegisterPage';

export default function App() {

    const [selectedItem, setSelectedItem] = useState('');

    const renderPage = () => {
        switch (selectedItem) {
            case 'Login':
                return <Login />
            case 'Register':
                return <Register />
            default:
                return <div className="w-full h-full flex justify-center items-center font-bold text-3xl text-white">Welcome to Local Personal Dev Assistant</div>;
        }
    }

    return (
        <div className='flex w-screen h-screen bg-zinc-800'>
            <Sidebar selected={selectedItem} onSelect={setSelectedItem} />
            <div className='w-4/5 h-full'>
                {renderPage()}
            </div>
        </div>
    );

}