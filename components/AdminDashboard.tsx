
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Users, BarChart2, ShieldAlert, Settings, Search, MoreHorizontal, 
    ArrowLeft, Activity, CreditCard, Server, MapPin, Zap, Lock, 
    CheckCircle, Ban, Trash2, Download, Terminal, RefreshCw, Database,
    Megaphone, X, DollarSign, Filter, Shield, User as UserIcon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '../utils';
import { User, Report } from '../types';
import { subscribeToAllUsers, toggleUserBan, toggleUserVerification, updateUserRole, subscribeToUserProfile } from '../services/userService';
import { subscribeToReports, resolveReport, deleteContent, createSystemAnnouncement, subscribeToPosts } from '../services/dataService';
import { auth } from '../services/firebase';

interface AdminDashboardProps {
    onBack?: () => void;
}

// Access Control
const VIEW_PERMISSIONS: Record<string, string[]> = {
    'overview': ['Admin', 'Moderator'],
    'users': ['Admin', 'Moderator'],
    'moderation': ['Admin', 'Moderator'],
    'finance': ['Admin'],
    'system': ['Admin'],
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<string>('overview');

    useEffect(() => {
        if (auth.currentUser) {
            const unsub = subscribeToUserProfile(auth.currentUser.uid, (user) => {
                setCurrentUser(user);
                setLoading(false);
            });
            return () => unsub();
        } else {
            setLoading(false);
        }
    }, []);

    // Strict Access Control Check
    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><RefreshCw className="animate-spin text-gsn-green" /></div>;
    
    const isAdmin = currentUser?.isAdmin === true || currentUser?.role === 'Admin';
    const isMod = currentUser?.role === 'Moderator';
    const hasAccess = isAdmin || isMod;

    if (!hasAccess) {
        return <UnauthorizedView onBack={onBack} />;
    }

    const canView = (view: string) => {
        if (isAdmin) return true;
        if (isMod && VIEW_PERMISSIONS[view].includes('Moderator')) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-20 lg:w-64 bg-zinc-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col md:h-screen md:sticky md:top-0 z-20">
                <div className="p-4 md:p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gsn-green rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.4)]">
                        <Activity className="text-black" size={20} />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white hidden lg:block">Command</span>
                </div>

                <nav className="flex-1 px-2 md:px-3 space-y-1 overflow-x-auto md:overflow-visible flex md:block">
                    {canView('overview') && (
                        <NavItem icon={<BarChart2 size={20} />} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
                    )}
                    {canView('users') && (
                        <NavItem icon={<Users size={20} />} label="Users" active={activeView === 'users'} onClick={() => setActiveView('users')} />
                    )}
                    {canView('moderation') && (
                        <NavItem icon={<ShieldAlert size={20} />} label="Moderation" active={activeView === 'moderation'} onClick={() => setActiveView('moderation')} />
                    )}
                    {canView('finance') && (
                        <NavItem icon={<CreditCard size={20} />} label="Finance" active={activeView === 'finance'} onClick={() => setActiveView('finance')} />
                    )}
                    {canView('system') && (
                        <NavItem icon={<Server size={20} />} label="System" active={activeView === 'system'} onClick={() => setActiveView('system')} />
                    )}
                </nav>

                <div className="p-4 border-t border-white/5 mt-auto hidden md:block">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <img src={currentUser?.avatar} className="w-8 h-8 rounded-full border border-white/20" alt="Admin" />
                        <div className="hidden lg:block">
                            <p className="text-xs font-bold text-white">{currentUser?.name}</p>
                            <p className="text-[10px] text-gsn-green uppercase font-bold">{isAdmin ? 'Administrator' : 'Moderator'}</p>
                        </div>
                    </div>
                    {onBack && (
                        <button onClick={onBack} className="flex items-center gap-3 w-full p-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                            <ArrowLeft size={20} />
                            <span className="hidden lg:block text-sm font-medium">Exit Admin</span>
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative z-10 overflow-y-auto h-[calc(100vh-64px)] md:h-screen p-4 lg:p-8">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeView === 'overview' && <OverviewView />}
                    {activeView === 'users' && <UsersView isAdmin={isAdmin} />}
                    {activeView === 'moderation' && <ModerationView />}
                    {activeView === 'finance' && <FinanceView />}
                    {activeView === 'system' && <SystemView />}
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex-1 md:w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-xl transition-all group whitespace-nowrap ${
            active 
            ? 'bg-gsn-green text-black font-bold shadow-[0_0_20px_rgba(74,222,128,0.2)]' 
            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
        }`}
    >
        {icon}
        <span className="hidden lg:block text-sm">{label}</span>
    </button>
);

const UnauthorizedView = ({ onBack }: { onBack?: () => void }) => (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none animate-pulse"></div>
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <Lock size={48} className="text-red-500" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2">ACCESS DENIED</h1>
        <p className="text-zinc-400 max-w-md mb-8">
            You do not have the required permissions to view the command center. This attempt has been logged.
        </p>
        {onBack && (
            <button onClick={onBack} className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors">
                Return to App
            </button>
        )}
    </div>
);

// --- VIEW COMPONENTS ---

const OverviewView = () => {
    const [stats, setStats] = useState({ users: 0, posts: 0, reports: 0 });
    
    // Fetch real counts (simplified for demo, ideally backend aggregation)
    useEffect(() => {
        const unsubUsers = subscribeToAllUsers(users => {
            setStats(prev => ({ ...prev, users: users.length }));
        });
        const unsubPosts = subscribeToPosts(posts => {
            setStats(prev => ({ ...prev, posts: posts.length }));
        });
        const unsubReports = subscribeToReports(reports => {
            setStats(prev => ({ ...prev, reports: reports.filter(r => r.status === 'Pending').length }));
        });
        
        return () => { unsubUsers(); unsubPosts(); unsubReports(); }
    }, []);

    // Mock Chart Data
    const data = [
        { name: 'Mon', val: 400 }, { name: 'Tue', val: 300 }, { name: 'Wed', val: 1200 },
        { name: 'Thu', val: 2800 }, { name: 'Fri', val: 3900 }, { name: 'Sat', val: 4200 }, { name: 'Sun', val: 3100 },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-black text-white mb-6">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.users.toLocaleString()} change="+12%" icon={<Users className="text-blue-400" />} />
                <StatCard title="Total Posts" value={stats.posts.toLocaleString()} change="+8.2%" icon={<Activity className="text-green-400" />} />
                <StatCard title="Pending Reports" value={stats.reports.toString()} change="" isNegative={stats.reports > 5} icon={<ShieldAlert className="text-red-400" />} />
                <StatCard title="Revenue (Est)" value="$12,450" change="+24%" icon={<DollarSign className="text-orange-400" />} />
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <h3 className="font-bold text-lg text-white mb-6">Traffic Activity</h3>
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
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '12px' }} />
                            <Area type="monotone" dataKey="val" stroke="#4ade80" strokeWidth={3} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

const UsersView = ({ isAdmin }: { isAdmin: boolean }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const unsub = subscribeToAllUsers(setUsers);
        return () => unsub();
    }, []);

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.handle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || u.role === filter || (filter === 'Banned' && u.isBanned) || (filter === 'Admin' && u.isAdmin);
        return matchesSearch && matchesFilter;
    });

    const handleAction = async (action: string, uid: string) => {
        if (!isAdmin) return;
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            if (action === 'ban') await toggleUserBan(uid, selectedUser?.isBanned || false);
            if (action === 'verify') await toggleUserVerification(uid, selectedUser?.verified || false);
            if (action === 'promote_admin') await updateUserRole(uid, 'Admin', true);
            if (action === 'demote') await updateUserRole(uid, 'Smoker', false);
            
            setSelectedUser(null); // Close modal
        } catch (e) {
            console.error(e);
            alert("Action failed.");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            {/* User Detail Modal */}
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
                                <div className="flex gap-2 mt-2">
                                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-xs font-bold text-zinc-300 uppercase">{selectedUser.role}</span>
                                    {selectedUser.isAdmin && <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-bold uppercase">ADMIN</span>}
                                    {selectedUser.isBanned && <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 text-xs font-bold uppercase">BANNED</span>}
                                </div>
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="space-y-3">
                                <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-widest">Administrative Actions</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => handleAction('verify', selectedUser.id)} className="py-3 bg-zinc-800 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-colors">
                                        {selectedUser.verified ? 'Revoke Verification' : 'Verify User'}
                                    </button>
                                    <button onClick={() => handleAction('ban', selectedUser.id)} className="py-3 bg-zinc-800 rounded-xl font-bold text-sm hover:bg-red-900/30 hover:text-red-500 transition-colors">
                                        {selectedUser.isBanned ? 'Unban User' : 'Ban User'}
                                    </button>
                                    <button onClick={() => handleAction('promote_admin', selectedUser.id)} className="py-3 bg-zinc-800 rounded-xl font-bold text-sm hover:bg-purple-900/30 hover:text-purple-400 transition-colors">
                                        Make Admin
                                    </button>
                                    <button onClick={() => handleAction('demote', selectedUser.id)} className="py-3 bg-zinc-800 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-colors">
                                        Reset to Member
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-white">User Directory</h2>
                <button className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Download size={16}/> Export CSV</button>
            </div>

            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 flex gap-4 flex-wrap">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-zinc-500" size={18} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or handle..." 
                            className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gsn-green"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['All', 'Admin', 'Grower', 'Banned'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-900 sticky top-0 z-10 text-xs text-zinc-500 uppercase">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4 hidden md:table-cell">Role</th>
                                <th className="p-4 hidden md:table-cell">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelectedUser(user)}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <div className="font-bold text-white">{user.name}</div>
                                                <div className="text-zinc-500 text-xs">{user.handle}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        <span className="bg-zinc-800 px-2 py-1 rounded text-xs text-zinc-300">{user.role}</span>
                                        {user.isAdmin && <span className="ml-2 bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">ADMIN</span>}
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        {user.isBanned ? <span className="text-red-500 font-bold">Banned</span> : <span className="text-green-500 font-bold">Active</span>}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"><MoreHorizontal size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

const ModerationView = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        const unsub = subscribeToReports(setReports);
        return () => unsub();
    }, []);

    const handleAction = async (action: 'dismiss' | 'delete') => {
        if (!selectedReport) return;
        
        if (action === 'delete') {
            await deleteContent(selectedReport.type, selectedReport.targetId);
            await resolveReport(selectedReport.id, 'Resolved');
        } else {
            await resolveReport(selectedReport.id, 'Dismissed');
        }
        setSelectedReport(null);
    };

    const pendingReports = reports.filter(r => r.status === 'Pending');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <h3 className="font-bold text-white mb-2">Report Queue</h3>
                    <div className="flex gap-2">
                        <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold">{pendingReports.length} Pending</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {pendingReports.map(report => (
                        <div 
                            key={report.id} 
                            onClick={() => setSelectedReport(report)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedReport?.id === report.id ? 'bg-white/5 border-gsn-green' : 'bg-zinc-900/50 border-white/5 hover:border-gsn-green/30'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold uppercase bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{report.type}</span>
                                <span className="text-[10px] text-zinc-500">{new Date(report.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm font-bold text-white mb-1">{report.reason}</p>
                            <p className="text-xs text-zinc-400 line-clamp-1">{report.details}</p>
                        </div>
                    ))}
                    {pendingReports.length === 0 && (
                        <div className="p-8 text-center text-zinc-500 text-sm flex flex-col items-center">
                            <CheckCircle size={32} className="mb-2 opacity-50" />
                            All clear! No pending reports.
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col relative overflow-hidden">
                {selectedReport ? (
                    <div className="flex flex-col h-full animate-in fade-in">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                                    <ShieldAlert size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedReport.reason}</h3>
                                    <p className="text-zinc-400 text-sm">Target ID: {selectedReport.targetId}</p>
                                </div>
                            </div>
                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">PENDING ACTION</span>
                        </div>

                        <div className="flex-1 bg-black/40 rounded-2xl p-6 mb-6 border border-white/5 overflow-y-auto">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-4">Report Details</h4>
                            <p className="text-zinc-300 text-sm leading-relaxed mb-4">{selectedReport.details || 'No additional details provided.'}</p>
                            
                            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Reporter</h4>
                            <p className="text-white text-sm font-bold">{selectedReport.reportedBy}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            <button onClick={() => handleAction('dismiss')} className="py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors">
                                Dismiss Report
                            </button>
                            <button onClick={() => handleAction('delete')} className="py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                                <Trash2 size={18} /> Delete Content
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500">
                        <Shield size={48} className="mb-4 opacity-20" />
                        <p>Select a report to view details.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const FinanceView = () => (
    <div className="space-y-6">
        <h2 className="text-3xl font-black text-white">Financials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-900/40 to-black border border-white/5 p-6 rounded-3xl">
                <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Total Revenue (MTD)</p>
                <h3 className="text-4xl font-black text-white">{formatCurrency(12450)}</h3>
            </div>
            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Platform Fees Collected</p>
                <h3 className="text-4xl font-black text-white">{formatCurrency(1840)}</h3>
            </div>
        </div>
        <div className="bg-zinc-900/40 p-8 rounded-3xl border border-white/5 text-center text-zinc-500">
            <BarChart2 size={48} className="mx-auto mb-4 opacity-20" />
            <p>Detailed transaction history integration coming soon.</p>
        </div>
    </div>
);

const SystemView = () => {
    const [announcement, setAnnouncement] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!announcement) return;
        setSending(true);
        await createSystemAnnouncement(announcement);
        setSending(false);
        setAnnouncement('');
        alert('Announcement broadcasted.');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-black text-white">System Controls</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 space-y-6">
                    <h3 className="font-bold text-white flex items-center gap-2"><Server size={20}/> Status</h3>
                    <div className="space-y-4">
                        <SystemMetric label="Database Latency" value="24ms" color="bg-green-500" />
                        <SystemMetric label="Storage Usage" value="45%" color="bg-orange-500" />
                        <SystemMetric label="API Health" value="99.9%" color="bg-blue-500" />
                    </div>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6">
                    <h3 className="font-bold text-white flex items-center gap-2 mb-4"><Megaphone size={20}/> Global Broadcast</h3>
                    <p className="text-zinc-400 text-xs mb-4">Send a system alert to all active users.</p>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={announcement} 
                            onChange={(e) => setAnnouncement(e.target.value)}
                            placeholder="Type announcement..."
                            className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-gsn-green outline-none"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={sending || !announcement}
                            className="bg-gsn-green text-black font-bold px-6 rounded-xl hover:bg-green-400 disabled:opacity-50"
                        >
                            {sending ? '...' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="bg-black rounded-xl p-4 font-mono text-xs text-green-400 h-64 overflow-y-auto border border-white/10">
                <p>[SYSTEM] Dashboard initialized.</p>
                <p>[SYSTEM] Connected to Firebase Realtime Database.</p>
                <p>[AUTH] Admin session active.</p>
            </div>
        </div>
    );
};

// --- HELPERS ---

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
);

const SystemMetric = ({ label, value, color }: any) => (
    <div>
        <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-zinc-400">{label}</span>
            <span className="text-white">{value}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: value.includes('%') ? value : '50%' }}></div>
        </div>
    </div>
);

export default AdminDashboard;
