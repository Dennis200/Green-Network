
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Users, BarChart2, ShieldAlert, Settings, Search, MoreHorizontal, 
    ArrowUpRight, ArrowDownRight, Filter, Download, Ban, CheckCircle, 
    Trash2, AlertTriangle, Eye, Globe, Save, Twitter, Instagram, MessageSquare, ArrowLeft,
    Activity, CreditCard, Bell, Database, Server, Cpu, MapPin, Zap, Lock, FileText, UserCheck, Flag, Shield, User,
    X, Check, AlertCircle, RefreshCw, Terminal, DollarSign, LogOut, Megaphone
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, BarChart, Bar, Legend } from 'recharts';
import { MOCK_ADMIN_STATS, MOCK_REPORTS, MOCK_USERS } from '../constants';
import { formatCurrency } from '../utils';
import { User as UserType } from '../types';

interface AdminDashboardProps {
    onBack?: () => void;
}

// Define the Role types available in the system
type AdminRole = 'Admin' | 'Moderator' | 'User';

// Define which views are accessible by which roles
const VIEW_PERMISSIONS: Record<string, AdminRole[]> = {
    'overview': ['Admin'],
    'users': ['Admin', 'Moderator'],
    'moderation': ['Admin', 'Moderator'],
    'finance': ['Admin'],
    'system': ['Admin'],
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
    // State to simulate the current user's role for demonstration purposes
    const [simulatedRole, setSimulatedRole] = useState<AdminRole>('Admin');
    const [activeView, setActiveView] = useState<string>('overview');

    // Reset view if role changes and they lose access to current view
    useEffect(() => {
        if (!hasAccess(activeView)) {
            // Find first accessible view
            const firstAllowed = Object.keys(VIEW_PERMISSIONS).find(view => VIEW_PERMISSIONS[view].includes(simulatedRole));
            if (firstAllowed) {
                setActiveView(firstAllowed);
            } else {
                setActiveView('unauthorized');
            }
        }
    }, [simulatedRole]);

    const hasAccess = (viewName: string) => {
        const allowedRoles = VIEW_PERMISSIONS[viewName];
        return allowedRoles && allowedRoles.includes(simulatedRole);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex">
            {/* Ambient Background */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gsn-green/5 via-black to-black pointer-events-none z-0"></div>
            
            {/* Sidebar Navigation */}
            <aside className="w-20 lg:w-64 bg-zinc-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col sticky top-0 h-screen z-20">
                <div className="p-6 flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gsn-green rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.4)]">
                        <Activity className="text-black" size={20} />
                    </div>
                    <span className="hidden lg:block font-bold text-xl tracking-tight text-white">Command</span>
                </div>

                {/* Role Switcher for Demo */}
                <div className="px-6 mb-6 hidden lg:block">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block tracking-widest">Simulate Role</label>
                    <div className="flex bg-zinc-900 p-1 rounded-lg border border-white/5">
                        <button 
                            onClick={() => setSimulatedRole('Admin')}
                            className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${simulatedRole === 'Admin' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Admin
                        </button>
                        <button 
                            onClick={() => setSimulatedRole('Moderator')}
                            className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${simulatedRole === 'Moderator' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Mod
                        </button>
                        <button 
                            onClick={() => setSimulatedRole('User')}
                            className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${simulatedRole === 'User' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                            User
                        </button>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {hasAccess('overview') && (
                        <NavItem 
                            icon={<BarChart2 size={20} />} 
                            label="Overview" 
                            active={activeView === 'overview'} 
                            onClick={() => setActiveView('overview')} 
                        />
                    )}
                    {hasAccess('users') && (
                        <NavItem 
                            icon={<Users size={20} />} 
                            label="User Management" 
                            active={activeView === 'users'} 
                            onClick={() => setActiveView('users')} 
                        />
                    )}
                    {hasAccess('moderation') && (
                        <NavItem 
                            icon={<ShieldAlert size={20} />} 
                            label="Moderation" 
                            active={activeView === 'moderation'} 
                            onClick={() => setActiveView('moderation')}
                            badge="12"
                        />
                    )}
                    {hasAccess('finance') && (
                        <NavItem 
                            icon={<CreditCard size={20} />} 
                            label="Finance" 
                            active={activeView === 'finance'} 
                            onClick={() => setActiveView('finance')} 
                        />
                    )}
                    {hasAccess('system') && (
                        <NavItem 
                            icon={<Server size={20} />} 
                            label="System Health" 
                            active={activeView === 'system'} 
                            onClick={() => setActiveView('system')} 
                        />
                    )}
                </nav>

                <div className="p-4 border-t border-white/5">
                    {onBack && (
                        <button 
                            onClick={onBack}
                            className="flex items-center gap-3 w-full p-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <ArrowLeft size={20} />
                            <span className="hidden lg:block text-sm font-medium">Exit Admin</span>
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative z-10 overflow-y-auto h-screen p-4 lg:p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                            {activeView === 'overview' && 'System Overview'}
                            {activeView === 'users' && 'User Directory'}
                            {activeView === 'moderation' && 'Moderation Queue'}
                            {activeView === 'finance' && 'Revenue Analysis'}
                            {activeView === 'system' && 'System Status'}
                            {activeView === 'unauthorized' && 'Access Denied'}
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border ${simulatedRole === 'Admin' ? 'border-purple-500/30' : simulatedRole === 'Moderator' ? 'border-blue-500/30' : 'border-white/10'}`}>
                            {simulatedRole === 'Admin' && <Shield size={14} className="text-purple-400" />}
                            {simulatedRole === 'Moderator' && <ShieldAlert size={14} className="text-blue-400" />}
                            {simulatedRole === 'User' && <User size={14} className="text-zinc-400" />}
                            <span className={`text-xs font-bold ${simulatedRole === 'Admin' ? 'text-purple-400' : simulatedRole === 'Moderator' ? 'text-blue-400' : 'text-zinc-400'}`}>
                                {simulatedRole.toUpperCase()} VIEW
                            </span>
                        </div>
                        <img src="https://picsum.photos/100/100?random=admin" className="w-10 h-10 rounded-full border border-white/10" alt="Admin" />
                    </div>
                </header>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Access Control Check */}
                    {activeView === 'unauthorized' || !hasAccess(activeView) ? (
                        <UnauthorizedView role={simulatedRole} />
                    ) : (
                        <>
                            {activeView === 'overview' && <OverviewView />}
                            {activeView === 'users' && <UsersView role={simulatedRole} />}
                            {activeView === 'moderation' && <ModerationView />}
                            {activeView === 'finance' && <FinanceView />}
                            {activeView === 'system' && <SystemView />}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: string }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
            active 
            ? 'bg-gsn-green text-black font-bold shadow-[0_0_20px_rgba(74,222,128,0.2)]' 
            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
        }`}
    >
        {icon}
        <span className="hidden lg:block text-sm">{label}</span>
        {badge && (
            <span className={`hidden lg:flex ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-black/20 text-black' : 'bg-gsn-green text-black'}`}>
                {badge}
            </span>
        )}
    </button>
);

const UnauthorizedView = ({ role }: { role: string }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-zinc-900/20 rounded-3xl border border-red-500/20">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <Lock size={40} className="text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Access Denied</h2>
        <p className="text-zinc-400 max-w-md">
            You do not have permission to view this resource. 
            <br/>Current Role: <span className="text-white font-bold">{role}</span>
        </p>
    </div>
);

const OverviewView = () => {
    const data = [
        { name: '00:00', value: 400 },
        { name: '04:00', value: 300 },
        { name: '08:00', value: 1200 },
        { name: '12:00', value: 2800 },
        { name: '16:00', value: 3900 },
        { name: '20:00', value: 4200 },
        { name: '23:59', value: 3100 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value="45.2k" change="+12%" icon={<Users className="text-blue-400" />} />
                <StatCard title="Revenue (MTD)" value={formatCurrency(12450)} change="+8.2%" icon={<CreditCard className="text-green-400" />} />
                <StatCard title="Active Now" value="1,240" change="+24%" icon={<Activity className="text-orange-400" />} />
                <StatCard title="Reports" value="23" change="-5%" isNegative icon={<ShieldAlert className="text-red-400" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-white">Live Traffic</h3>
                        <div className="flex gap-2">
                            <span className="text-xs text-zinc-500 font-mono">Real-time WebSocket</span>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#555" axisLine={false} tickLine={false} />
                                <YAxis stroke="#555" axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={3} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6">
                    <h3 className="font-bold text-lg text-white mb-4">Pending Verification</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-colors">
                                <img src={`https://picsum.photos/50/50?random=${i+20}`} className="w-10 h-10 rounded-full" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-white truncate">User_{i}99</p>
                                    <p className="text-xs text-zinc-500">ID Uploaded • 2m ago</p>
                                </div>
                                <div className="flex gap-1">
                                    <button className="p-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20"><CheckCircle size={16} /></button>
                                    <button className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"><Ban size={16} /></button>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-2 text-xs font-bold text-zinc-500 hover:text-white mt-2">View All Requests</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const UsersView = ({ role }: { role: AdminRole }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [roleFilter, setRoleFilter] = useState<string>('All');
    const [users, setUsers] = useState<UserType[]>(MOCK_USERS);

    const handleAction = (action: string, userId: string) => {
        // Simulate API action
        switch(action) {
            case 'ban': 
                setUsers(prev => prev.map(u => u.id === userId ? {...u, bio: '[BANNED USER]'} : u)); // Visual indicator
                break;
            case 'verify':
                setUsers(prev => prev.map(u => u.id === userId ? {...u, verified: !u.verified} : u));
                break;
            case 'delete':
                if(confirm('Are you sure you want to delete this user?')) {
                    setUsers(prev => prev.filter(u => u.id !== userId));
                    setSelectedUser(null);
                }
                break;
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  u.handle.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'All' || u.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    return (
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
            {/* Extended User Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-white/10 p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24} /></button>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <img src={selectedUser.avatar} className="w-20 h-20 rounded-full border-4 border-zinc-800" />
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {selectedUser.name}
                                    {selectedUser.verified && <CheckCircle size={20} className="text-gsn-green" />}
                                </h2>
                                <p className="text-zinc-400">{selectedUser.handle}</p>
                                <span className="inline-block mt-2 px-2 py-0.5 rounded bg-zinc-800 text-xs font-bold text-zinc-300 uppercase">{selectedUser.role}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                <p className="text-xs text-zinc-500 font-bold uppercase">Posts</p>
                                <p className="text-xl font-black text-white">420</p>
                            </div>
                            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                <p className="text-xs text-zinc-500 font-bold uppercase">Followers</p>
                                <p className="text-xl font-black text-white">12.5k</p>
                            </div>
                            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                <p className="text-xs text-zinc-500 font-bold uppercase">Reports</p>
                                <p className="text-xl font-black text-red-500">0</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-widest">Actions</h3>
                            <div className="flex gap-2">
                                <button onClick={() => handleAction('verify', selectedUser.id)} className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                                    <CheckCircle size={16} /> {selectedUser.verified ? 'Unverify' : 'Verify'}
                                </button>
                                <button className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                                    <Settings size={16} /> Edit Role
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAction('ban', selectedUser.id)} className="flex-1 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                                    <Ban size={16} /> Ban User
                                </button>
                                {role === 'Admin' && (
                                    <button onClick={() => handleAction('delete', selectedUser.id)} className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                                        <Trash2 size={16} /> Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 border-b border-white/5 flex gap-4 items-center flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 text-zinc-500" size={18} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users..." 
                        className="w-full bg-black border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gsn-green"
                    />
                </div>
                <div className="flex gap-2">
                    {['All', 'Admin', 'Grower', 'Brand'].map(r => (
                        <button 
                            key={r}
                            onClick={() => setRoleFilter(r)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${roleFilter === r ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
                {role === 'Admin' && (
                    <button className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-xl text-sm font-bold hover:text-white flex items-center gap-2">
                        <Download size={16} /> Export
                    </button>
                )}
            </div>
            
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-zinc-900 z-10">
                        <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-bold">User</th>
                            <th className="p-4 font-bold hidden md:table-cell">Role</th>
                            <th className="p-4 font-bold hidden md:table-cell">Status</th>
                            <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedUser(user)}>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatar} className="w-10 h-10 rounded-full border border-white/10" alt={user.name} />
                                        <div>
                                            <div className="font-bold text-white flex items-center gap-2">
                                                {user.name} 
                                                {user.verified && <CheckCircle size={12} className="text-gsn-green" />}
                                            </div>
                                            <p className="text-zinc-500 text-xs">{user.handle}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 hidden md:table-cell">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        user.role === 'Admin' ? 'bg-purple-500/10 text-purple-400' :
                                        user.role === 'Brand' ? 'bg-blue-500/10 text-blue-400' :
                                        'bg-zinc-800 text-zinc-400'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 hidden md:table-cell">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}>
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ModerationView = () => {
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [reports, setReports] = useState(MOCK_REPORTS);

    const handleResolve = (id: string, action: 'dismiss' | 'delete') => {
        setReports(prev => prev.filter(r => r.id !== id));
        setSelectedReport(null);
        alert(`Report ${action}ed successfully.`);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
            {/* Sidebar List */}
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <h3 className="font-bold text-white mb-2">Report Queue</h3>
                    <div className="flex gap-2">
                        <button className="flex-1 py-1.5 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg border border-red-500/20">High Priority</button>
                        <button className="flex-1 py-1.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-lg">Newest</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {reports.map(report => (
                        <div 
                            key={report.id} 
                            onClick={() => setSelectedReport(report)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedReport?.id === report.id ? 'bg-white/5 border-gsn-green' : 'bg-zinc-900/50 border-white/5 hover:border-gsn-green/30'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.type === 'User' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{report.type}</span>
                                <span className="text-[10px] text-zinc-500">{report.date}</span>
                            </div>
                            <p className="text-sm font-bold text-white mb-1">{report.reason}</p>
                            <p className="text-xs text-zinc-400">Reported by <span className="text-zinc-300">User123</span></p>
                        </div>
                    ))}
                    {reports.length === 0 && (
                        <div className="p-8 text-center text-zinc-500 text-sm">
                            <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                            All caught up!
                        </div>
                    )}
                </div>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col relative overflow-hidden">
                {selectedReport ? (
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedReport.reason}</h3>
                                    <p className="text-zinc-400 text-sm">Report ID: #{selectedReport.id}</p>
                                </div>
                            </div>
                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">PENDING</span>
                        </div>

                        <div className="flex-1 bg-black/40 rounded-2xl p-6 mb-6 border border-white/5">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-4">Reported Content</h4>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0"></div>
                                <div>
                                    <p className="text-sm font-bold text-white mb-1">{selectedReport.user}</p>
                                    <p className="text-zinc-300 text-sm leading-relaxed">
                                        This is a preview of the reported content. It might contain offensive text or images.
                                        {/* Mock content */}
                                        <br/><br/>
                                        "Check out these cheap clones for sale! DM me for prices."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            <button onClick={() => handleResolve(selectedReport.id, 'dismiss')} className="py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors">
                                Dismiss Report
                            </button>
                            <button onClick={() => handleResolve(selectedReport.id, 'delete')} className="py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                                <Trash2 size={18} /> Delete & Warn
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <ShieldAlert size={32} className="text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Select a report</h3>
                        <p className="text-zinc-500 max-w-xs">Review content context, user history, and take action.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const FinanceView = () => {
    // Mock Transaction Data
    const transactions = [
        { id: 'tx_1', user: 'Kush Master', type: 'Ad Campaign', amount: 21.00, status: 'Completed', date: '2 mins ago' },
        { id: 'tx_2', user: 'Top Shelf', type: 'Premium Sub', amount: 9.99, status: 'Completed', date: '1 hour ago' },
        { id: 'tx_3', user: 'Dr. Green', type: 'Ad Campaign', amount: 45.00, status: 'Pending', date: '3 hours ago' },
        { id: 'tx_4', user: 'Sativa Diva', type: 'Premium Sub', amount: 9.99, status: 'Refunded', date: '1 day ago' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-900/40 to-black border border-white/5 p-6 rounded-3xl">
                    <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Total Revenue</p>
                    <h3 className="text-4xl font-black text-white">{formatCurrency(124592)}</h3>
                    <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gsn-green w-[70%]"></div>
                    </div>
                </div>
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                    <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Active Subscriptions</p>
                    <h3 className="text-4xl font-black text-white">8,204</h3>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6">
                    <h3 className="font-bold text-lg text-white mb-6">Revenue Stream</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[{name: 'M', v: 10}, {name: 'T', v: 15}, {name: 'W', v: 8}, {name: 'T', v: 22}, {name: 'F', v: 30}, {name: 'S', v: 35}, {name: 'S', v: 40}]}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#555" axisLine={false} tickLine={false} />
                                <YAxis stroke="#555" axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }} />
                                <Area type="monotone" dataKey="v" stroke="#4ade80" fill="url(#colorRev)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col">
                    <h3 className="font-bold text-lg text-white mb-4">Recent Transactions</h3>
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors border border-white/5">
                                <div>
                                    <p className="text-white font-bold text-sm">{tx.user}</p>
                                    <p className="text-zinc-500 text-xs">{tx.type}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-mono font-bold text-sm ${tx.status === 'Refunded' ? 'text-red-500 line-through' : 'text-gsn-green'}`}>
                                        ${tx.amount.toFixed(2)}
                                    </p>
                                    <p className="text-zinc-600 text-[10px]">{tx.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 bg-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors">View All</button>
                </div>
            </div>
        </div>
    );
};

const SystemView = () => {
    const [maintenance, setMaintenance] = useState(false);
    const [announcement, setAnnouncement] = useState('');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 space-y-6">
                <h3 className="font-bold text-white flex items-center gap-2"><Server size={20}/> Server Status</h3>
                
                <div className="space-y-4">
                    <SystemMetric label="CPU Usage" value="34%" color="bg-blue-500" />
                    <SystemMetric label="Memory" value="12.4GB / 32GB" color="bg-purple-500" percent="40%" />
                    <SystemMetric label="Storage" value="45%" color="bg-orange-500" />
                    <SystemMetric label="Database Latency" value="24ms" color="bg-green-500" />
                </div>

                <div className="flex gap-4 pt-4">
                    <button className="flex-1 py-2 bg-zinc-800 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center gap-2">
                        <RefreshCw size={14} /> Clear Cache
                    </button>
                    <button className="flex-1 py-2 bg-zinc-800 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center gap-2">
                        <Database size={14} /> Backup DB
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6">
                <h3 className="font-bold text-white flex items-center gap-2 mb-6"><Settings size={20}/> System Controls</h3>
                
                <div className="space-y-4">
                    <ToggleItem 
                        label="Global Maintenance Mode" 
                        desc="Disable app access for non-admins" 
                        active={maintenance} 
                        onToggle={() => setMaintenance(!maintenance)} 
                        isDanger 
                    />
                    <ToggleItem label="New Registrations" desc="Allow new users to sign up" active />
                    <ToggleItem label="Live Streaming" desc="Enable Go Live feature" active />
                    
                    <div className="pt-4 border-t border-white/5">
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Global Announcement</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                                placeholder="Alert message for all users..." 
                                className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-gsn-green focus:outline-none"
                            />
                            <button className="p-2 bg-gsn-green text-black rounded-xl hover:bg-green-400 transition-colors">
                                <Megaphone size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 col-span-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2"><Terminal size={18} /> System Logs</h3>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 text-[10px] font-bold rounded">INFO</span>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded">WARN</span>
                        <span className="px-2 py-1 bg-red-500/20 text-red-500 text-[10px] font-bold rounded">ERR</span>
                    </div>
                </div>
                <div className="bg-black rounded-xl p-4 font-mono text-xs text-green-400 h-64 overflow-y-auto space-y-1">
                    <p>[2023-10-26 14:20:01] INFO: User user_492 verified successfully.</p>
                    <p>[2023-10-26 14:19:55] WARN: High latency detected on shard_02 (400ms).</p>
                    <p>[2023-10-26 14:18:22] INFO: New deployment v2.4.1 successful.</p>
                    <p className="text-blue-400">[2023-10-26 14:15:00] CRON: Backup completed.</p>
                    <p>[2023-10-26 14:12:43] INFO: Report #882 resolved by admin.</p>
                    <p className="text-red-500">[2023-10-26 14:10:12] ERROR: Payment gateway timeout (TxID: 992).</p>
                    <p>[2023-10-26 14:08:00] INFO: User signup: green_grower_22.</p>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, icon, isNegative }: any) => (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-colors group">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-zinc-900 rounded-xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isNegative ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                {change}
            </span>
        </div>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
    </div>
)

const SystemMetric = ({ label, value, color, percent }: any) => (
    <div>
        <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-zinc-400">{label}</span>
            <span className="text-white">{value}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: percent || value }}></div>
        </div>
    </div>
)

const ToggleItem = ({ label, desc, active, onToggle, isDanger }: any) => (
    <div className={`flex justify-between items-center p-3 bg-zinc-900/50 rounded-xl border border-white/5 ${isDanger && active ? 'border-red-500/30 bg-red-500/5' : ''}`}>
        <div>
            <p className={`font-bold text-sm ${isDanger && active ? 'text-red-500' : 'text-white'}`}>{label}</p>
            <p className="text-xs text-zinc-500">{desc}</p>
        </div>
        <button 
            onClick={onToggle}
            className={`w-12 h-6 rounded-full relative transition-colors ${active ? (isDanger ? 'bg-red-500' : 'bg-gsn-green') : 'bg-zinc-700'}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`}></div>
        </button>
    </div>
)

export default AdminDashboard;
