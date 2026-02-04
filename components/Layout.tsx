import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AuthModal from './AuthModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { user, wallets, isAuthenticated, login, register, logout, isLoading } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Dropdown State
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleAuthClick = (type: string) => {
    if (type === 'Login') {
        setAuthModalType('LOGIN');
        setIsAuthModalOpen(true);
    } else if (type === 'Registration') {
        setAuthModalType('REGISTER');
        setIsAuthModalOpen(true);
    }
  };

  const handleModalSubmit = (data: any) => {
      if (authModalType === 'REGISTER') {
          register(data); 
      }
  };

  const handleLogout = () => {
      logout();
      setIsProfileMenuOpen(false);
      navigate('/');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const usdtBalance = wallets.find(w => w.currency === 'USDT')?.balance || 0;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden text-primary font-sans bg-background transition-colors duration-300">
      
      {/* Background Environment - Subtle Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-background">
        <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-primary flex items-center justify-center transform group-hover:rotate-180 transition-transform duration-500 rounded-sm">
                <div className="w-3 h-3 bg-background rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tighter text-primary leading-none">NEXUS</span>
                <span className="text-[10px] font-mono text-secondary tracking-[0.2em] uppercase">Prime</span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: t('nav_markets'), path: '/' },
                { label: t('nav_trade'), path: '/trade/BTCUSDT' },
                { label: t('nav_derivatives'), path: '/derivatives' },
                { label: t('nav_earn'), path: '/earn' }
              ].map((item) => (
                <Link 
                  key={item.label}
                  to={item.path} 
                  className={`px-4 py-2 text-sm font-medium tracking-wide transition-all relative group ${
                    isActive(item.path)
                      ? 'text-primary font-bold' 
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${isActive(item.path) ? 'scale-x-100' : ''}`}></span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
             {/* Theme Switcher (Single Button) */}
             <button 
                onClick={toggleTheme}
                className="flex items-center justify-center w-8 h-8 rounded border border-border text-secondary hover:bg-surface hover:text-primary transition-colors"
                title={`Switch to ${resolvedTheme === 'light' ? 'Dark' : 'Light'} Mode`}
             >
                {resolvedTheme === 'light' ? (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                ) : (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
             </button>

             {/* Language Switcher */}
             <button 
                onClick={toggleLanguage}
                className="flex items-center justify-center w-8 h-8 rounded border border-border text-xs font-mono font-bold text-secondary hover:bg-surface transition-colors"
             >
                {language.toUpperCase()}
             </button>

             <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-secondary'}`}></span>
                <span className="text-xs font-mono text-secondary">{isAuthenticated ? 'CONNECTED' : t('net_stable')}</span>
             </div>
             
             {isAuthenticated ? (
                <div className="flex items-center gap-4 relative">
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-secondary font-mono">BALANCE</div>
                        <div className="text-sm font-bold font-mono text-primary">${usdtBalance.toLocaleString()}</div>
                    </div>
                    
                    {/* Profile Dropdown Trigger */}
                    <button 
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="h-9 w-9 bg-primary text-background flex items-center justify-center font-bold text-sm hover:opacity-90 transition-opacity rounded-sm"
                    >
                        {user?.first_name ? user.first_name[0] : user?.username?.substring(0,1).toUpperCase()}
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                            <div className="absolute top-12 right-0 w-48 bg-background border border-border shadow-xl z-50 flex flex-col py-2 animate-fade-in">
                                <div className="px-4 py-2 border-b border-border mb-1">
                                    <p className="text-primary font-bold truncate">{user?.first_name} {user?.last_name}</p>
                                    <p className="text-[10px] text-secondary truncate">{user?.email}</p>
                                </div>
                                <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="px-4 py-2 text-sm text-secondary hover:bg-surface hover:text-primary transition-colors">
                                    Account Profile
                                </Link>
                                {user?.role === 'admin' && (
                                    <Link to="/admin" onClick={() => setIsProfileMenuOpen(false)} className="px-4 py-2 text-sm text-red-600 hover:bg-surface transition-colors">
                                        Admin Panel
                                    </Link>
                                )}
                                <div className="border-t border-border mt-1 pt-1">
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-surface transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
             ) : (
                <div className="flex items-center gap-3">
                    {/* LOGIN BUTTON */}
                    <button 
                    onClick={() => handleAuthClick('Login')}
                    className="relative px-5 py-2 text-sm font-bold tracking-wide rounded-sm overflow-hidden group hidden sm:block"
                    disabled={isLoading}
                    >
                      <span className="absolute inset-0 w-full h-full bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                      <span className="relative z-10 text-secondary group-hover:text-background transition-colors duration-300">{t('login')}</span>
                    </button>

                    {/* REGISTER BUTTON */}
                    <button 
                    onClick={() => handleAuthClick('Registration')}
                    className="relative px-5 py-2 text-primary text-sm font-bold tracking-wide rounded-sm overflow-hidden group"
                    disabled={isLoading}
                    >
                      <span className="absolute inset-0 w-full h-full bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                      <span className="relative z-10 group-hover:text-background transition-colors duration-300">{t('register')}</span>
                    </button>
                </div>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow w-full max-w-[1800px] mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 bg-background transition-colors duration-300">
        <div className="max-w-[1800px] mx-auto px-6 flex justify-between items-center text-[10px] font-mono text-secondary uppercase tracking-wider">
          <p>{t('sys_ver')}</p>
          <div className="flex gap-6">
             <span>{t('latency')}</span>
             <span>{t('server')}</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        type={authModalType}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default Layout;