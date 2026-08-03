import { useState, useRef, useEffect } from 'react';
import { Film, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

type Role = 'staff' | 'manager';

interface LoginScreenProps {
  onLogin: (role: Role) => void;
}

const PASSWORDS: Record<string, Role> = {
  staff: 'staff',
  manager: 'manager',
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const role = PASSWORDS[password.toLowerCase()];

    if (role) {
      setLoading(true);
      setError('');
      // Brief delay for smooth UX
      await new Promise((r) => setTimeout(r, 500));
      onLogin(role);
    } else {
      setError('Incorrect password. Please try again.');
      setShaking(true);
      setPassword('');
      setTimeout(() => setShaking(false), 600);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(221,189,104,0.06) 0%, transparent 70%)',
        }}
      />

      <div
        className={`relative w-full max-w-sm transition-all duration-300 ${shaking ? 'login-shake' : ''}`}
        style={{ animation: shaking ? undefined : undefined }}
      >
        {/* Card */}
        <div
          className="relative rounded-2xl overflow-hidden p-8"
          style={{
            background: 'rgba(17,17,17,0.85)',
            border: '1px solid rgba(221,189,104,0.15)',
            boxShadow:
              '0 0 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Top gold line */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(221,189,104,0.6) 30%, rgba(221,189,104,0.6) 70%, transparent)',
            }}
          />

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(221,189,104,0.08)', border: '1px solid rgba(221,189,104,0.2)' }}
              >
                <Film className="w-7 h-7 text-[#DDBD68]" />
              </div>
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(221,189,104,0.15) 0%, transparent 70%)',
                  filter: 'blur(8px)',
                }}
              />
            </div>
            <span className="text-shimmer font-serif text-2xl font-black tracking-[0.3em] uppercase">
              Dionysus
            </span>
            <span className="text-[#DDBD68]/40 text-[10px] tracking-[0.4em] uppercase font-medium mt-1">
              Staff Portal
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-[10px] tracking-widest uppercase font-semibold text-[#DDBD68]/60 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#DDBD68]/40 pointer-events-none"
                />
                <input
                  id="password"
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:ring-2 focus:ring-[#DDBD68]/40"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: error
                      ? '1px solid rgba(239,68,68,0.5)'
                      : '1px solid rgba(255,255,255,0.08)',
                  }}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#DDBD68]/30 hover:text-[#DDBD68]/70 transition-colors cursor-pointer"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Error message */}
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: error ? '40px' : '0px', opacity: error ? 1 : 0 }}
              >
                <div className="flex items-center gap-1.5 mt-2 text-red-400/90 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!password || loading}
              className="w-full py-3 rounded-xl text-xs tracking-widest font-semibold uppercase transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: !password || loading
                  ? 'rgba(221,189,104,0.2)'
                  : 'linear-gradient(135deg, #DDBD68 0%, #FCEEAA 50%, #DDBD68 100%)',
                color: !password || loading ? '#DDBD68' : '#0C0C0C',
                boxShadow:
                  password && !loading
                    ? '0 0 24px rgba(221,189,104,0.3), 0 0 8px rgba(221,189,104,0.2)'
                    : 'none',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent inline-block"
                    style={{ animation: 'spin 0.7s linear infinite' }}
                  />
                  Authenticating…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes login-shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-8px); }
          35%       { transform: translateX(8px); }
          55%       { transform: translateX(-6px); }
          75%       { transform: translateX(6px); }
          90%       { transform: translateX(-3px); }
        }
        .login-shake { animation: login-shake 0.55s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
