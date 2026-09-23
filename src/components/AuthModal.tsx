import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider, syncUserProfile } from '../services/firebase';
import { UserProfile } from '../types';
import { FmmLogo } from './FmmLogo';
import {
  Shield,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle,
  X,
  LogIn,
  UserPlus,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profile: UserProfile) => void;
  onAuthSuccess?: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const profile = await syncUserProfile({
          ...userCred.user,
          displayName: displayName.trim() || userCred.user.displayName,
        } as any);
        (onSuccess || onAuthSuccess)?.(profile);
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const profile = await syncUserProfile(userCred.user);
        (onSuccess || onAuthSuccess)?.(profile);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed. Please verify credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account already exists with this email address. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserProfile(userCred.user);
      (onSuccess || onAuthSuccess)?.(profile);
      onClose();
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setError(err.message || 'Failed to sign in with Google account.');
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to fill admin or field staff credentials
  const fillPreset = (type: 'admin' | 'staff') => {
    if (type === 'admin') {
      setEmail('ashqararealty@gmail.com');
      setPassword('AdminPass123!');
      setDisplayName('Project Admin');
    } else {
      setEmail('field.officer@labourproject.org');
      setPassword('StaffPass123!');
      setDisplayName('Field Officer (Ramesh)');
    }
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-slate-100">
          <div className="p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <FmmLogo size="sm" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {isRegister ? 'Register Field Staff Account' : 'Staff Sign In'}
            </h2>
            <p className="text-xs text-slate-500">
              FMM BLSA Project • Towards wholeness
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isRegister && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Officer name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@organization.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In with Email'}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
            <span className="bg-white px-2">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Sign In
        </button>

        {/* Quick Role Fill for testing/demo */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
            <KeyRound className="w-3 h-3 text-slate-400" />
            Quick Demo Autofill:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillPreset('admin')}
              className="flex-1 py-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-bold text-center"
            >
              Admin (ashqararealty@gmail.com)
            </button>
            <button
              type="button"
              onClick={() => fillPreset('staff')}
              className="flex-1 py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-[10px] font-bold text-center"
            >
              Field Staff
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            {isRegister
              ? 'Already registered? Sign in here'
              : 'New officer? Register account'}
          </button>
        </div>
      </div>
    </div>
  );
};
