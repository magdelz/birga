import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext'; 

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'LOGIN' | 'REGISTER';
  onSubmit: (data: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, type, onSubmit }) => {
  const { t } = useLanguage();
  const { login } = useAuth();
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [secretKey, setSecretKey] = useState(''); 
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'LOGIN') {
        login(email, password).then(() => onClose()); 
    } else {
        onSubmit({
            email: regEmail,
            firstName,
            lastName,
            secretKey,
            password: regPassword
        });
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-md animate-fade-in p-4 overflow-y-auto">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-background p-8 w-full max-w-md relative z-10 border border-border shadow-2xl my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <h2 className="text-3xl font-bold text-primary mb-2 tracking-tight">
          {type === 'LOGIN' ? t('login') : t('register')}
        </h2>
        <p className="text-xs font-mono text-secondary mb-6 uppercase tracking-widest border-b border-border pb-4">
           SECURE_ACCESS_GATEWAY // {type === 'LOGIN' ? 'AUTH' : 'NEW_ID'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {type === 'LOGIN' ? (
              <>
                <div className="group">
                    <label className="block text-[10px] font-mono text-secondary mb-1 font-bold">IDENTITY (EMAIL)</label>
                    <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="swiss-input w-full px-4 py-3 text-sm rounded-sm"
                    placeholder="trader@nexus.com"
                    required 
                    autoFocus
                    />
                </div>
                
                <div className="group">
                    <label className="block text-[10px] font-mono text-secondary mb-1 font-bold">PASSWORD</label>
                    <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="swiss-input w-full px-4 py-3 text-sm rounded-sm"
                    placeholder="••••••••"
                    required
                    />
                </div>
              </>
          ) : (
              <>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className="block text-[10px] font-mono text-secondary mb-1 font-bold">FIRST NAME</label>
                        <input 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="swiss-input w-full px-3 py-2 text-sm"
                        required
                        />
                    </div>
                    <div className="group">
                        <label className="block text-[10px] font-mono text-secondary mb-1 font-bold">LAST NAME</label>
                        <input 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="swiss-input w-full px-3 py-2 text-sm"
                        required
                        />
                    </div>
                 </div>

                 <div className="group">
                    <label className="block text-[10px] font-mono text-secondary mb-1 font-bold">EMAIL ADDRESS</label>
                    <input 
                    type="email" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="swiss-input w-full px-3 py-2 text-sm"
                    required
                    />
                 </div>

                 <div className="group">
                    <label className="block text-[10px] font-mono text-secondary mb-1 flex justify-between font-bold">
                        <span>SECRET KEY</span>
                        <span className="text-secondary text-[9px]">Recovery Phrase</span>
                    </label>
                    <input 
                    type="text" 
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="swiss-input w-full px-3 py-2 text-sm"
                    placeholder="e.g. blue-nebula-protocol"
                    required
                    />
                 </div>

                 <div className="group">
                    <label className="block text-[10px] font-mono text-secondary mb-1 font-bold">PASSWORD</label>
                    <input 
                    type="password" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="swiss-input w-full px-3 py-2 text-sm"
                    required
                    />
                 </div>
              </>
          )}

          <div className="pt-4">
            <button 
                type="submit"
                className="w-full py-3 bg-primary hover:opacity-90 text-background font-bold text-sm uppercase tracking-widest transition-all shadow-md rounded-sm"
            >
                {type === 'LOGIN' ? 'INITIALIZE SESSION' : 'GENERATE ID'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-[10px] text-secondary font-mono">
                By accessing this terminal, you agree to the <span className="text-primary underline cursor-pointer">Protocol Protocols</span>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;