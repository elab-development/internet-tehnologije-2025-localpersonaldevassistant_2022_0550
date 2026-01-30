import { useState } from "react";


export default function Login() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full h-full">
      <h2 className="text-white font-bold text-[60px]">Login</h2>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-baseline gap-3 text-white">
          <label className="text-2xl font-bold" htmlFor="username">Username:</label>
          <input onChange={(e) => setUsername(e.target.value)} id="username" className="w-80 border-2 rounded-2xl text-xl p-1 pl-3 outline-0" type="text" />
        </div>
        <div className="flex items-center justify-baseline gap-3 text-white">
          <label className="text-2xl font-bold" htmlFor="password">Password:</label>
          <input onChange={(e) => setPassword(e.target.value)} id="password" className="w-full border-2 rounded-2xl text-xl p-1 pl-3 outline-0" type="password" />
        </div>
      </div>
      {/* Login button */}
      <div className="text-white font-bold text-2xl p-3 pl-10 pr-10 bg-zinc-600 rounded-xl cursor-pointer hover:bg-zinc-700 duration-200">
        Sign in
      </div>
    </div>
  );
}