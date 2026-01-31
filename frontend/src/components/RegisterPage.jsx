import { useState } from "react";
import { register } from "../api/auth";  

export default function Register({ onRegister }) {  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');  
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);  


  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validacija
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const user = await register(email, fullName, password);
      console.log('Registration successful:', user);
      onRegister(user);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full h-full">
      <h2 className="text-white font-bold text-[60px]">Register</h2>
      
      {}
      {error && (
        <div className="text-red-500 bg-red-100 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-baseline gap-3 text-white">
          <label className="text-2xl font-bold" htmlFor="fullname">Full name:</label>
          <input 
            onChange={(e) => setFullName(e.target.value)} 
            id="fullname" 
            className="w-80 border-2 rounded-2xl text-xl p-1 pl-3 outline-0" 
            type="text"
            disabled={loading}  
          />
        </div>
        {}
        <div className="flex items-center justify-baseline gap-3 text-white">
          <label className="text-2xl font-bold" htmlFor="email">Email:</label>
          <input 
            onChange={(e) => setEmail(e.target.value)} 
            id="email" 
            className="w-full border-2 rounded-2xl text-xl p-1 pl-3 outline-0" 
            type="email"  
            disabled={loading}  
          />
        </div>
        <div className="flex items-center justify-baseline gap-3 text-white">
          <label className="text-2xl font-bold" htmlFor="password">Password:</label>
          <input 
            onChange={(e) => setPassword(e.target.value)} 
            id="password" 
            className="w-full border-2 rounded-2xl text-xl p-1 pl-3 outline-0" 
            type="password"
            disabled={loading} 
          />
        </div>
        
        <div className="flex items-center justify-baseline gap-3 text-white">
          <label className="text-2xl font-bold" htmlFor="confirmPassword">Confirm:</label>
          <input 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            id="confirmPassword" 
            className="w-full border-2 rounded-2xl text-xl p-1 pl-3 outline-0" 
            type="password"
            disabled={loading}
          />
        </div>
      </div>
      
      {/* Sign up button */}
      <div 
        onClick={handleRegister}  
        className={`text-white font-bold text-2xl p-3 pl-10 pr-10 bg-zinc-600 rounded-xl cursor-pointer hover:bg-zinc-700 duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}  // ← DODATO: loading style
      >
        {loading ? 'Signing up...' : 'Sign up'}  {}
      </div>
    </div>
  );
}

