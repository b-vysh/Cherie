import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect to admin dashboard
  if (user) {
    navigate('/admin');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 font-body">
      <div className="bg-brand-peach w-full max-w-md p-8 rounded-[16px] shadow-sm">
        <h1 className="text-2xl font-heading text-[#115E63] text-center mb-6">Admin Portal</h1>
        
        {error && (
          <div className="bg-brand-accent/20 border border-brand-accent text-[#115E63] p-3 rounded-[10px] text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[#115E63] text-sm font-bold mb-2">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-brand-bg border border-brand-primary/20 rounded-[10px] px-4 py-3 text-[#115E63] focus:outline-none focus:border-brand-primary transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-[#115E63] text-sm font-bold mb-2">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-bg border border-brand-primary/20 rounded-[10px] px-4 py-3 text-[#115E63] focus:outline-none focus:border-brand-primary transition-colors"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-primary text-[#115E63] font-bold py-3 px-4 rounded-[10px] hover:bg-brand-primary/90 transition-colors mt-4 disabled:opacity-70"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
