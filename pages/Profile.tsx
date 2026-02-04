import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
  });

  if (!user) return <div className="p-20 text-center text-red-500 font-mono">ACCESS DENIED</div>;

  const handleToggle2FA = async () => {
    const newState = !user.is_2fa_enabled;
    await updateProfile({ is_2fa_enabled: newState });
    alert(`Two-Factor Authentication ${newState ? 'ENABLED' : 'DISABLED'}`);
  };

  const handleSave = async () => {
    await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="relative py-8 border-b border-border pb-8">
           <h1 className="text-6xl font-bold text-primary uppercase leading-none tracking-tighter">
             OPERATOR <span className="text-secondary">PROFILE</span>
           </h1>
           <p className="mt-2 text-secondary font-mono text-sm tracking-wide">
             ID: {user.id}
           </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Identity Card */}
          <div className="swiss-card p-6 flex flex-col items-center text-center md:col-span-1">
             <div className="w-32 h-32 rounded-full bg-surface border border-border flex items-center justify-center mb-6 relative group">
                <span className="text-4xl font-bold text-primary">{user.first_name?.[0]}{user.last_name?.[0]}</span>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-background"></div>
             </div>
             
             <h2 className="text-2xl font-bold text-primary">{user.first_name} {user.last_name}</h2>
             <p className="text-secondary font-mono text-sm mb-4">@{user.username}</p>
             <span className="px-3 py-1 bg-surface border border-border rounded text-[10px] font-mono text-secondary uppercase tracking-widest">
                 Role: {user.role}
             </span>
          </div>

          {/* Settings & Details */}
          <div className="md:col-span-2 space-y-6">
              
              {/* Personal Info */}
              <div className="swiss-card p-6">
                  <div className="flex justify-between items-center mb-6 border-b border-border pb-2">
                      <h3 className="text-xl font-bold text-primary">PERSONAL_DATA</h3>
                      <button 
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`px-4 py-1 text-xs font-bold font-mono border ${isEditing ? 'border-emerald-500 text-emerald-600' : 'border-border text-secondary hover:bg-surface'} transition-all rounded-sm`}
                      >
                          {isEditing ? 'SAVE CHANGES' : 'EDIT DATA'}
                      </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                      <div className="group">
                          <label className="block text-[10px] font-mono text-secondary mb-1 font-bold">FIRST NAME</label>
                          <input 
                             disabled={!isEditing}
                             value={formData.firstName}
                             onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                             className="swiss-input w-full px-3 py-2 text-sm disabled:bg-surface disabled:text-secondary"
                          />
                      </div>
                      <div className="group">
                          <label className="block text-[10px] font-mono text-secondary mb-1 font-bold">LAST NAME</label>
                          <input 
                             disabled={!isEditing}
                             value={formData.lastName}
                             onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                             className="swiss-input w-full px-3 py-2 text-sm disabled:bg-surface disabled:text-secondary"
                          />
                      </div>
                      <div className="group col-span-2">
                          <label className="block text-[10px] font-mono text-secondary mb-1 font-bold">EMAIL (VERIFIED)</label>
                          <input 
                             disabled
                             value={user.email}
                             className="swiss-input w-full px-3 py-2 text-sm bg-surface text-secondary cursor-not-allowed"
                          />
                      </div>
                      <div className="group col-span-2">
                          <label className="block text-[10px] font-mono text-secondary mb-1 font-bold">SECRET KEY (ENCRYPTED)</label>
                          <input 
                             disabled
                             value="••••••••••••••••••••••••"
                             className="swiss-input w-full px-3 py-2 text-sm bg-surface text-secondary cursor-not-allowed"
                          />
                      </div>
                  </div>
              </div>

              {/* Security Settings */}
              <div className="swiss-card p-6 border-l-4 border-l-primary">
                  <h3 className="text-xl font-bold text-primary mb-4">SECURITY_PROTOCOLS</h3>
                  
                  <div className="flex items-center justify-between py-4 border-b border-border">
                      <div>
                          <p className="text-sm font-bold text-primary">Two-Factor Authentication (2FA)</p>
                          <p className="text-xs text-secondary mt-1">Secure your account with TOTP.</p>
                      </div>
                      <button 
                        onClick={handleToggle2FA}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${user.is_2fa_enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-background transition-transform duration-300 ${user.is_2fa_enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                      <div>
                          <p className="text-sm font-bold text-primary">Session Management</p>
                          <p className="text-xs text-secondary mt-1">Log out of all other devices.</p>
                      </div>
                      <button className="text-xs font-mono font-bold text-red-600 border border-red-200 px-3 py-1 hover:bg-red-50 transition-all rounded-sm">
                          TERMINATE ALL
                      </button>
                  </div>
              </div>

              {/* Interface Settings */}
              <div className="swiss-card p-6 border-l-4 border-l-secondary">
                  <h3 className="text-xl font-bold text-primary mb-4">INTERFACE_PROTOCOLS</h3>
                  
                  <div className="flex items-center justify-between py-4 border-b border-border">
                      <div>
                          <p className="text-sm font-bold text-primary">Theme Preference</p>
                          <p className="text-xs text-secondary mt-1">Override system default display settings.</p>
                      </div>
                      <div className="flex bg-surface rounded-sm border border-border p-1">
                          {['light', 'dark', 'system'].map((t) => (
                              <button
                                  key={t}
                                  onClick={() => setTheme(t as any)}
                                  className={`px-3 py-1 text-[10px] font-bold font-mono uppercase rounded-sm transition-all ${theme === t ? 'bg-primary text-background shadow-sm' : 'text-secondary hover:text-primary'}`}
                              >
                                  {t}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};

export default Profile;