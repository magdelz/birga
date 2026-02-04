import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { UserProfile } from '../types';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [systemUsers, setSystemUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
        if (!user || user.role !== 'admin') return;
        
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setSystemUsers(data || []);
        } catch (err) {
            console.error('Error fetching users for admin:', err);
        } finally {
            setLoading(false);
        }
    };
    
    fetchUsers();
  }, [user]);

  if (!user || user.role !== 'admin') {
      return (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
              <h1 className="text-6xl font-bold text-red-600 mb-4">RESTRICTED</h1>
              <p className="font-mono text-secondary">Security Clearance Level 5 Required.</p>
          </div>
      );
  }

  return (
    <div className="space-y-10 animate-fade-in">
       {/* Hero */}
       <div className="relative py-8 border-b border-border pb-8">
           <h1 className="text-6xl font-bold text-primary uppercase leading-none tracking-tighter">
             ADMIN <span className="text-secondary">CONSOLE</span>
           </h1>
           <p className="mt-2 text-secondary font-mono text-sm tracking-wide">
             SYSTEM_OVERRIDE // USER_DATABASE
           </p>
       </div>

       {/* Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="swiss-card p-4 border-l-4 border-l-primary">
               <p className="font-mono text-xs text-secondary font-bold tracking-widest">TOTAL USERS</p>
               <p className="text-3xl font-bold text-primary mt-1">{loading ? '...' : systemUsers.length}</p>
           </div>
           <div className="swiss-card p-4 border-l-4 border-l-primary">
               <p className="font-mono text-xs text-secondary font-bold tracking-widest">ACTIVE SESSIONS</p>
               <p className="text-3xl font-bold text-primary mt-1">LIVE</p>
           </div>
           <div className="swiss-card p-4 border-l-4 border-l-primary">
               <p className="font-mono text-xs text-secondary font-bold tracking-widest">SYSTEM HEALTH</p>
               <p className="text-3xl font-bold text-primary mt-1">100%</p>
           </div>
           <div className="swiss-card p-4 border-l-4 border-l-primary">
               <p className="font-mono text-xs text-secondary font-bold tracking-widest">DB STATUS</p>
               <p className="text-3xl font-bold text-emerald-600 mt-1">OK</p>
           </div>
       </div>

       {/* User Management Table */}
       <div className="swiss-card p-0 overflow-hidden">
           <div className="p-4 bg-surface border-b border-border flex justify-between items-center">
               <h3 className="font-bold text-primary font-mono">USER_REGISTRY (REALTIME)</h3>
               <button className="text-[10px] bg-primary hover:opacity-90 text-background px-3 py-1 font-bold uppercase rounded-sm">EXPORT LOGS</button>
           </div>
           
           {loading ? (
             <div className="p-8 text-center text-secondary font-mono animate-pulse">Scanning database...</div>
           ) : (
             <table className="w-full text-left">
               <thead>
                   <tr className="text-[10px] font-mono text-secondary uppercase bg-background border-b border-border">
                       <th className="p-4">User Identity</th>
                       <th className="p-4">Secret Key</th>
                       <th className="p-4">Role</th>
                       <th className="p-4">Created At</th>
                       <th className="p-4 text-right">Actions</th>
                   </tr>
               </thead>
               <tbody className="text-sm font-mono divide-y divide-border">
                   {systemUsers.map(u => (
                       <tr key={u.id} className="hover:bg-hover transition-colors">
                           <td className="p-4">
                               <div className="text-primary font-bold">{u.first_name} {u.last_name}</div>
                               <div className="text-xs text-secondary">{u.email}</div>
                               <div className="text-[10px] text-secondary opacity-50">ID: {u.id}</div>
                           </td>
                           <td className="p-4">
                               <span className="text-xs text-secondary font-mono bg-surface px-2 py-1 rounded">
                                   {u.secret_key || 'N/A'}
                               </span>
                           </td>
                           <td className="p-4">
                               <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-surface text-secondary'}`}>
                                   {u.role.toUpperCase()}
                               </span>
                           </td>
                           <td className="p-4 text-secondary text-xs">
                               {new Date(u.created_at).toLocaleString()}
                           </td>
                           <td className="p-4 text-right space-x-2">
                               <button className="text-blue-600 font-bold hover:underline">EDIT</button>
                               <button className="text-red-600 font-bold hover:underline">BAN</button>
                           </td>
                       </tr>
                   ))}
                   {systemUsers.length === 0 && (
                       <tr>
                           <td colSpan={5} className="p-8 text-center text-secondary">No users found in database.</td>
                       </tr>
                   )}
               </tbody>
             </table>
           )}
       </div>
    </div>
  );
};

export default AdminPanel;