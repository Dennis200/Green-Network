
import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Bell, Shield, Moon, Volume2, HelpCircle, LogOut, ChevronRight, Mail, Smartphone, Check, Eye, EyeOff, CheckCircle, Leaf, MessageCircle, RefreshCw } from 'lucide-react';

interface SettingsProps {
    onBack: () => void;
    onLogout?: () => void;
}

type SettingsView = 'main' | 'account' | 'notifications' | 'privacy' | 'help';

const Settings: React.FC<SettingsProps> = ({ onBack, onLogout }) => {
    const [view, setView] = useState<SettingsView>('main');

    // MOCK PREFERENCES
    const [darkMode, setDarkMode] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [emailNotifs, setEmailNotifs] = useState(true);

    const renderContent = () => {
        switch(view) {
            case 'account':
                return <AccountSettings onBack={() => setView('main')} />;
            case 'notifications':
                return (
                    <SubPage title="Notifications" onBack={() => setView('main')}>
                        <ToggleItem label="Push Notifications" active={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} desc="Receive alerts on your device" />
                        <ToggleItem label="Email Notifications" active={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} desc="Receive digest emails" />
                        <div className="h-px bg-white/5 my-4"></div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2 px-2">Alert Types</h4>
                        <SettingItem icon={<User size={20} />} label="New Followers" onClick={() => alert("Notification settings updated!")} />
                        <SettingItem icon={<MessageCircle size={20} />} label="Messages" onClick={() => alert("Message settings updated!")} />
                    </SubPage>
                );
            case 'privacy':
                return (
                    <SubPage title="Privacy & Security" onBack={() => setView('main')}>
                        <SettingItem icon={<Lock size={20} />} label="Change Password" onClick={() => alert("Password change flow initiated.")} />
                        <SettingItem icon={<Shield size={20} />} label="Two-Factor Authentication" badge="Off" onClick={() => alert("2FA setup initiated.")} />
                        <ToggleItem label="Public Profile" active={true} onToggle={() => {}} desc="Allow anyone to see your posts" />
                        <ToggleItem label="Show Online Status" active={true} onToggle={() => {}} desc="Let friends see when you are active" />
                        <div className="h-px bg-white/5 my-4"></div>
                        <SettingItem icon={<EyeOff size={20} />} label="Blocked Users" onClick={() => alert("Opening blocked users list...")} />
                    </SubPage>
                );
            case 'help':
                return (
                    <SubPage title="Help & Support" onBack={() => setView('main')}>
                        <SettingItem icon={<HelpCircle size={20} />} label="FAQ" onClick={() => alert("Opening FAQ...")} />
                        <SettingItem icon={<Mail size={20} />} label="Contact Support" onClick={() => alert("Opening support chat...")} />
                        <SettingItem icon={<Shield size={20} />} label="Community Guidelines" onClick={() => alert("Opening guidelines...")} />
                    </SubPage>
                );
            default:
                return (
                    <div className="max-w-2xl mx-auto p-4 space-y-6 animate-in slide-in-from-left duration-200">
                        {/* Account Section */}
                        <Section title="Account">
                            <SettingItem icon={<User size={20} />} label="Personal Information" onClick={() => setView('account')} />
                            <SettingItem icon={<Shield size={20} />} label="Privacy & Security" onClick={() => setView('privacy')} />
                        </Section>

                        {/* Preferences */}
                        <Section title="Preferences">
                            <SettingItem icon={<Bell size={20} />} label="Notifications" onClick={() => setView('notifications')} />
                            <ToggleItem label="Dark Mode" active={darkMode} onToggle={() => setDarkMode(!darkMode)} icon={<Moon size={20} />} />
                            <SettingItem icon={<Volume2 size={20} />} label="Sound & Media" onClick={() => alert("Sound settings opened.")} />
                        </Section>

                        {/* Support & Legal */}
                        <Section title="Support">
                            <SettingItem icon={<HelpCircle size={20} />} label="Help Center" onClick={() => setView('help')} />
                            <SettingItem icon={<Shield size={20} />} label="Terms of Service" onClick={() => alert("Opening Terms...")} />
                        </Section>

                        <button 
                            onClick={onLogout}
                            className="w-full bg-red-500/10 text-red-500 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors mt-8"
                        >
                            <LogOut size={20} /> Log Out
                        </button>

                        <p className="text-center text-zinc-600 text-xs mt-4">Green Stoners Network v1.0.4</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-black pb-20 md:pb-0">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-white/10 p-4 flex items-center gap-4">
                <button onClick={view === 'main' ? onBack : () => setView('main')} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">{view === 'main' ? 'Settings' : view.charAt(0).toUpperCase() + view.slice(1)}</h1>
            </div>

            {renderContent()}
        </div>
    );
};

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div>
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 px-2">{title}</h3>
        <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/5">
            {children}
        </div>
    </div>
);

const SettingItem = ({ icon, label, value, badge, onClick }: { icon: React.ReactNode, label: string, value?: string, badge?: string, onClick?: () => void }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-800 transition-colors group text-left"
    >
        <div className="flex items-center gap-4">
            <div className="text-zinc-400 group-hover:text-white transition-colors">{icon}</div>
            <span className="font-medium text-white">{label}</span>
        </div>
        <div className="flex items-center gap-3">
            {value && <span className="text-zinc-500 text-sm">{value}</span>}
            {badge && <span className="bg-gsn-green/10 text-gsn-green text-xs font-bold px-2 py-0.5 rounded border border-gsn-green/20">{badge}</span>}
            <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400" />
        </div>
    </button>
);

const ToggleItem = ({ label, active, onToggle, desc, icon }: { label: string, active: boolean, onToggle: () => void, desc?: string, icon?: React.ReactNode }) => (
    <div className="flex items-center justify-between p-4 hover:bg-zinc-800 transition-colors">
        <div className="flex items-center gap-4">
            {icon && <div className="text-zinc-400">{icon}</div>}
            <div>
                <p className="font-medium text-white">{label}</p>
                {desc && <p className="text-xs text-zinc-500">{desc}</p>}
            </div>
        </div>
        <button 
            onClick={onToggle}
            className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-gsn-green' : 'bg-zinc-700'}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`}></div>
        </button>
    </div>
);

const SubPage = ({ title, onBack, children }: { title: string, onBack: () => void, children?: React.ReactNode }) => (
    <div className="max-w-2xl mx-auto p-4 space-y-6 animate-in slide-in-from-right duration-200">
        <h2 className="text-2xl font-black text-white px-2">{title}</h2>
        <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/5">
            {children}
        </div>
    </div>
);

const AccountSettings = ({ onBack }: { onBack: () => void }) => {
    return (
        <SubPage title="Personal Information" onBack={onBack}>
            <div className="p-4 space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
                    <div className="flex justify-between items-center">
                        <span className="text-white">user@example.com</span>
                        <button className="text-gsn-green text-sm font-bold" onClick={() => alert("Edit Email Modal")}>Edit</button>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Phone</label>
                    <div className="flex justify-between items-center">
                        <span className="text-white">+1 (555) 123-4567</span>
                        <button className="text-gsn-green text-sm font-bold" onClick={() => alert("Edit Phone Modal")}>Edit</button>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-zinc-800/50">
                <div className="flex items-center gap-3">
                    <CheckCircle className="text-gsn-green" size={20} />
                    <div>
                        <p className="font-bold text-white text-sm">Identity Verified</p>
                        <p className="text-xs text-zinc-400">You are a verified grower 21+.</p>
                    </div>
                </div>
            </div>
        </SubPage>
    );
};

export default Settings;
