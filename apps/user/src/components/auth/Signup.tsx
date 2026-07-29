import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, deleteUser } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export function Signup({ onBack, onNavigateToLogin }: { onBack: () => void, onNavigateToLogin: () => void }) {
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes = 180 seconds

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isVerifyingEmail && timeLeft > 0) {
      intervalId = setInterval(async () => {
        setTimeLeft((prev) => prev - 1);
        
        if (auth.currentUser) {
          try {
            await auth.currentUser.reload();
            if (auth.currentUser.emailVerified) {
              clearInterval(intervalId);

              // Only save profile data and database record AFTER they verify
              await updateProfile(auth.currentUser, {
                displayName: `${firstName} ${lastName}`
              });

              await setDoc(doc(db, 'users', auth.currentUser.uid), {
                firstName,
                lastName,
                email,
                createdAt: new Date().toISOString()
              });

              onNavigateToLogin();
            }
          } catch (err) {
            console.error('Error checking verification status', err);
          }
        }
      }, 1000);
    } else if (isVerifyingEmail && timeLeft <= 0) {
      // Timer expired
      const cleanupExpiredUser = async () => {
        if (auth.currentUser) {
          try {
            await deleteUser(auth.currentUser);
          } catch (err) {
            console.error('Failed to clean up expired user', err);
          }
        }
        setIsVerifyingEmail(false);
        setError('The verification link has expired after 3 minutes. Please sign up again.');
        setTimeLeft(180);
      };
      cleanupExpiredUser();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isVerifyingEmail, timeLeft, onNavigateToLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isVerifyingEmail) {
      // User is already verifying, polling is handling the check.
      return;
    }

    if (!firstName || !lastName || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one capital letter.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError('Password must contain at least one special character.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // We only create the auth account and send the email.
      // Profile updates and Firestore docs are delayed until verification passes.
      await sendEmailVerification(userCredential.user);
      setIsVerifyingEmail(true);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else {
        setError(err.message || 'Failed to create account.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    if (isVerifyingEmail && auth.currentUser && !auth.currentUser.emailVerified) {
      try {
        await deleteUser(auth.currentUser);
      } catch (err) {
        console.error('Failed to clean up user on back', err);
      }
    }
    onBack();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto animate-fade-up py-10">
      <div className="text-center mb-8">
        <h2
          className="text-[#DDBD68] text-2xl sm:text-3xl font-black tracking-widest mb-2"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          {isVerifyingEmail ? 'Verify Email' : 'Create Account'}
        </h2>
        <p className="text-[#DDBD68]/55 text-xs tracking-[0.15em] uppercase px-4 leading-relaxed">
          {isVerifyingEmail 
            ? (
              <>
                A verification link has been sent to your email.<br />
                Please click the link to verify your account.
              </>
            )
            : 'Join Dionysus Cinema'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg text-center tracking-wide">
            {error}
          </div>
        )}

        {!isVerifyingEmail && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#FCEEAA]/45 text-[10px] uppercase tracking-[0.2em] font-semibold">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.10] focus:border-[#DDBD68]/50 rounded-lg px-4 py-3 text-[#DDBD68] text-sm placeholder:text-white/20 outline-none transition-colors duration-200 w-full"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#FCEEAA]/45 text-[10px] uppercase tracking-[0.2em] font-semibold">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="dela Cruz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.10] focus:border-[#DDBD68]/50 rounded-lg px-4 py-3 text-[#DDBD68] text-sm placeholder:text-white/20 outline-none transition-colors duration-200 w-full"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#FCEEAA]/45 text-[10px] uppercase tracking-[0.2em] font-semibold">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.10] focus:border-[#DDBD68]/50 rounded-lg px-4 py-3 text-[#DDBD68] text-sm placeholder:text-white/20 outline-none transition-colors duration-200 w-full"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#FCEEAA]/45 text-[10px] uppercase tracking-[0.2em] font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.10] focus:border-[#DDBD68]/50 rounded-lg px-4 py-3 text-[#DDBD68] text-sm placeholder:text-white/20 outline-none transition-colors duration-200 w-full pr-10"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#DDBD68] transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {isVerifyingEmail && (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="relative mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#DDBD68] opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            
            <p className="text-[#DDBD68] text-[11px] font-bold uppercase tracking-[0.3em] mb-4 animate-pulse">
              Waiting for verification...
            </p>

            <div className="mt-2 flex flex-col items-center">
              <span 
                className="text-lg font-bold tracking-widest text-[#DDBD68] select-none"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
              <p className="text-red-400/70 text-[10px] uppercase tracking-widest mt-2">
                Link expires in 3 minutes
              </p>
            </div>
          </div>
        )}

        {!isVerifyingEmail && (
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full py-3.5 rounded-xl font-bold text-xs tracking-[0.18em] uppercase transition-all duration-300 bg-gradient-to-r from-[#DDBD68] via-[#FCEEAA] to-[#DDBD68] text-[#0C0C0C] cursor-pointer hover:shadow-[0_0_24px_rgba(221,189,104,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Sign Up'}
          </button>
        )}
      </form>

      {!isVerifyingEmail && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-[#DDBD68]/60 hover:text-[#DDBD68] text-[10px] uppercase tracking-widest transition-colors cursor-pointer font-semibold"
          >
            Already have an account? Login
          </button>
        </div>
      )}

      <button
        onClick={handleBack}
        className={`${isVerifyingEmail ? 'mt-8' : 'mt-6'} border border-[#DDBD68]/35 text-[#DDBD68] hover:bg-[#DDBD68]/10 px-6 py-2 rounded-full text-[10px] tracking-widest uppercase font-semibold transition-all cursor-pointer`}
      >
        Back to Home
      </button>
    </div>
  );
}
