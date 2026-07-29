import { useState } from 'react';

export function Login({ onBack }: { onBack: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for now, and go back
    onBack();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto animate-fade-up py-10">
      <div className="text-center mb-8">
        <h2
          className="text-[#DDBD68] text-2xl sm:text-3xl font-black tracking-widest mb-2"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-[#DDBD68]/55 text-xs tracking-[0.15em] uppercase">
          {isRegister ? 'Join Dionysus Cinema' : 'Sign in to continue'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[#FCEEAA]/45 text-[10px] uppercase tracking-[0.2em] font-semibold">
            Email
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/[0.04] border border-white/[0.10] focus:border-[#DDBD68]/50 rounded-lg px-4 py-3 text-[#DDBD68] text-sm placeholder:text-white/20 outline-none transition-colors duration-200 w-full"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[#FCEEAA]/45 text-[10px] uppercase tracking-[0.2em] font-semibold">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/[0.04] border border-white/[0.10] focus:border-[#DDBD68]/50 rounded-lg px-4 py-3 text-[#DDBD68] text-sm placeholder:text-white/20 outline-none transition-colors duration-200 w-full"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>

        <button
          type="submit"
          className="mt-4 w-full py-3.5 rounded-xl font-bold text-xs tracking-[0.18em] uppercase transition-all duration-300 bg-gradient-to-r from-[#DDBD68] via-[#FCEEAA] to-[#DDBD68] text-[#0C0C0C] cursor-pointer hover:shadow-[0_0_24px_rgba(221,189,104,0.4)]"
        >
          {isRegister ? 'Sign Up' : 'Login'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          className="text-[#DDBD68]/60 hover:text-[#DDBD68] text-[10px] uppercase tracking-widest transition-colors cursor-pointer font-semibold"
        >
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign up"}
        </button>
      </div>

      <button
        onClick={onBack}
        className="mt-6 border border-[#DDBD68]/35 text-[#DDBD68] hover:bg-[#DDBD68]/10 px-6 py-2 rounded-full text-[10px] tracking-widest uppercase font-semibold transition-all cursor-pointer"
      >
        Back to Home
      </button>
    </div>
  );
}
