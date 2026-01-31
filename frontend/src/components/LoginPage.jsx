import { useState, useRef, useEffect } from "react";
import { login } from "../api/auth";

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      console.log('Login successful:', data.user);
      onLogin(data.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full h-full">
      <h2 className="text-white font-bold text-[60px]">Login</h2>
      
      {error && (
        <div className="text-red-500 bg-red-100 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-baseline gap-3 text-white">
          <label className="text-2xl font-bold" htmlFor="email">Email:</label>
          <input 
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            id="email"
            className="w-80 border-2 rounded-2xl text-xl p-1 pl-3 outline-0" 
            type="email"
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-baseline gap-3 text-white">
          <label className="text-2xl font-bold" htmlFor="password">Password:</label>
          <input 
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            id="password" 
            className="w-full border-2 rounded-2xl text-xl p-1 pl-3 outline-0" 
            type="password"
            disabled={loading}
          />
        </div>
      </div>
      
      <div 
        onClick={handleLogin}
        className={`text-white font-bold text-2xl p-3 pl-10 pr-10 bg-zinc-600 rounded-xl cursor-pointer hover:bg-zinc-700 duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </div>

      <p className="text-white text-center mt-5">
        Don't have an account? 
        <span 
          onClick={onSwitchToRegister} 
          className="underline cursor-pointer ml-2 font-bold"
        >
          Register here
        </span>
      </p>
    </div>
  );
}