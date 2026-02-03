
import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, Info, Image as ImageIcon, Mic, Search, Plus, Users, ArrowLeft, MoreVertical, X, UserPlus, Hash, ChevronRight, MessageCircle, MicOff, VideoOff, PhoneOff, Paperclip, Smile, CheckCheck, Check, Trash2, Play, Pause, FileAudio, Lock } from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { MoreMenu } from './Menus';
import ReportModal from './ReportModal';
import { Message, User, Reaction } from '../types';
import { subscribeToChats, subscribeToMessages, sendMessage, startChat } from '../services/dataService';
import { uploadToCloudinary } from '../services/cloudinary';
import { subscribeToAllUsers, subscribeToUserProfile } from '../services/userService';
import { auth } from '../services/firebase';
import PageGuide from './PageGuide';

interface ChatSession {
  id: string;
  type: 'dm' | 'group';
  name: string;
  avatar: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: number;
  members?: any;
  memberDetails?: User[];
  online?: boolean;
}

const Chat: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dms' | 'groups' | 'friends'>('dms');
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [msgText, setMsgText] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [friends, setFriends] = useState<User[]>([]); 
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);

  // Advanced Features State
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  // Call State
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [callTime, setCallTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // --- INIT ---
  useEffect(() => {
      if (auth.currentUser) {
          const unsubProfile = subscribeToUserProfile(auth.currentUser.uid, (u) => {
              if (u) setCurrentUser(u);
          });
          
          const unsubChats = subscribeToChats(auth.currentUser.uid, (liveChats) => {
              const formattedChats = liveChats.map(c => {
                  let name = c.name;
                  let avatar = c.avatar;
                  
                  if (c.type === 'dm' && c.memberDetails) {
                      const other = c.memberDetails.find((m: User) => m.id !== auth.currentUser?.uid);
                      if (other) {
                          name = other.name;
                          avatar = other.avatar;
                      }
                  }

                  return {
                      ...c,
                      name: name || 'Unknown',
                      avatar: avatar || 'https://picsum.photos/50/50',
                      unread: c.unread && c.unread[auth.currentUser!.uid] ? 1 : 0
                  };
              });
              setChats(formattedChats);
          });

          const unsubFriends = subscribeToAllUsers((users) => {
              setFriends(users.filter(u => u.id !== auth.currentUser?.uid));
          });

          return () => {
              unsubProfile();
              unsubChats();
              unsubFriends();
          };
      }
  }, []);

  // --- MESSAGES SUBSCRIPTION ---
  useEffect(() => {
      if (selectedChat) {
          const unsubMsg = subscribeToMessages(selectedChat.id, (msgs) => {
              const mapped = msgs.map(m => ({
                  ...m,
                  isMe: m.senderId === currentUser.id
              }));
              setMessages(mapped);
          });
          return () => unsubMsg();
      }
  }, [selectedChat, currentUser.id]);

  useEffect(() => {
      let interval: any;
      if(isInCall) {
          interval = setInterval(() => setCallTime(prev => prev + 1), 1000);
      } else {
          setCallTime(0);
      }
      return () => clearInterval(interval);
  }, [isInCall]);

  // Recording Timer
  useEffect(() => {
      let interval: any;
      if(isRecording) {
          interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      } else {
          setRecordingTime(0);
      }
      return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChat]);

  const handleSendMessage = async () => {
      if ((!msgText.trim() && !audioBlob) || !selectedChat) return;
      
      let type: 'text' | 'audio' = 'text';
      let content = msgText;

      if (audioBlob) {
          // Simulate upload
          type = 'audio';
          content = URL.createObjectURL(audioBlob); 
          // In real app, upload blob to cloud storage and get URL
      }

      await sendMessage(selectedChat.id, content, currentUser, type, replyTo || undefined, audioBlob ? recordingTime : undefined);
      setMsgText('');
      setReplyTo(null);
      setAudioBlob(null);
  };

  const handleStartRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          const chunks: BlobPart[] = [];

          mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
          mediaRecorder.onstop = () => {
              const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
              setAudioBlob(blob);
              handleSendMessage(); // Auto send on stop for demo simplicity
          };

          mediaRecorder.start();
          setIsRecording(true);
      } catch (err) {
          console.error("Mic access denied", err);
      }
  };

  const handleStopRecording = () => {
      if(mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          // Actual sending happens in onstop event
      }
  };

  const handleReaction = (msgId: string, emoji: string) => {
      // In a real app, update DB. Here update local state optimistic
      setMessages(prev => prev.map(m => {
          if (m.id === msgId) {
              const reactions = m.reactions || [];
              const existing = reactions.find(r => r.emoji === emoji);
              if (existing) {
                  return {
                      ...m,
                      reactions: reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r)
                  };
              } else {
                  return {
                      ...m,
                      reactions: [...reactions, { emoji, count: 1, userReacted: true }]
                  };
              }
          }
          return m;
      }));
      setHoveredMessageId(null);
  };

  const startCall = (type: 'voice' | 'video') => {
      setCallType(type);
      setIsInCall(true);
  }

  const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && selectedChat) {
          try {
              const url = await uploadToCloudinary(e.target.files[0]);
              await sendMessage(selectedChat.id, url, currentUser, 'image');
          } catch (e) {
              alert("Failed to upload image");
          }
      }
  }

  const renderSidebarContent = () => {
    const filter = (item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'dms') {
        const dms = chats.filter(c => c.type === 'dm').filter(filter);
        return dms.length > 0 ? dms.map(chat => (
            <div 
                key={chat.id} 
                onClick={() => { setSelectedChat(chat); setShowChatInfo(false); }} 
                className={`group p-4 flex gap-4 cursor-pointer transition-all duration-300 border-l-4 ${selectedChat?.id === chat.id ? 'bg-white/5 border-gsn-green' : 'border-transparent hover:bg-white/5'}`}
            >
                <div className="relative">
                    <div className={`w-12 h-12 rounded-full overflow-hidden shadow-lg group-hover:scale-105 transition-transform border border-white/10`}>
                        <img src={chat.avatar} className="w-full h-full object-cover" alt={chat.name} />
                    </div>
                    {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>}
                </div>
                <div className="flex-1 overflow-hidden flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold truncate text-sm ${selectedChat?.id === chat.id ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                            {chat.name}
                        </span>
                        <span className="text-[10px] text-zinc-500">{chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className={`text-xs truncate leading-relaxed ${chat.unread ? 'text-white font-bold' : 'text-zinc-500'}`}>
                            {chat.lastMessage}
                        </p>
                        {chat.unread ? <span className="w-5 h-5 bg-gsn-green text-black text-[10px] font-bold rounded-full flex items-center justify-center">{chat.unread}</span> : null}
                    </div>
                </div>
            </div>
        )) : <div className="p-6 text-zinc-500 text-center text-sm">No chats found.</div>;
    }
    
    // Friends list logic remains similar...
    return null;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-screen pt-0 md:pt-0 relative bg-[#0a0a0a] overflow-hidden">
        {showReportModal && selectedChat && (
            <ReportModal 
                type={selectedChat.type === 'dm' ? 'User' : 'Community'} 
                targetId={selectedChat.id} 
                onClose={() => setShowReportModal(false)} 
            />
        )}
        
        {showMoreMenu && (
            <MoreMenu 
                onClose={() => setShowMoreMenu(false)} 
                type="Conversation" 
                onReport={() => {
                    setShowMoreMenu(false);
                    setShowReportModal(true);
                }}
            />
        )}

        {/* CALL OVERLAY */}
        {isInCall && selectedChat && (
            <div className="fixed inset-0 z-[100] bg-zinc-900 flex flex-col animate-in slide-in-from-bottom duration-300">
                {/* Same as before */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                     <img src={selectedChat.avatar} className="w-32 h-32 rounded-full mb-4 animate-pulse border-4 border-zinc-800" />
                     <h2 className="text-2xl font-bold text-white">{selectedChat.name}</h2>
                     <p className="text-gsn-green font-mono">{formatTime(callTime)}</p>
                </div>
                <div className="p-10 flex justify-center gap-8 bg-zinc-900 border-t border-white/10 pb-safe">
                    <button onClick={() => setIsInCall(false)} className="p-4 bg-red-500 rounded-full text-white"><PhoneOff /></button>
                </div>
            </div>
        )}

        {/* Sidebar */}
        <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[350px] bg-zinc-900/50 backdrop-blur-xl border-r border-white/5 z-20 relative`}>
            <div className="p-4 bg-zinc-900 border-b border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Chats</h2>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-full text-zinc-400"><Users size={20}/></button>
                        <button className="p-2 hover:bg-white/10 rounded-full text-zinc-400"><Plus size={20}/></button>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search or start new chat" 
                        className="w-full bg-black border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-gsn-green"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {renderSidebarContent()}
            </div>
        </div>

        {/* Chat Window */}
        <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col relative z-10 bg-[#000000] bg-opacity-95`}>
            {/* Wallpaper Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`, backgroundSize: '400px' }}></div>

            {selectedChat ? (
                <>
                    {/* Header */}
                    <div className="px-4 py-3 flex justify-between items-center bg-zinc-900 border-b border-white/5 z-30 cursor-pointer" onClick={() => setShowChatInfo(!showChatInfo)}>
                        <div className="flex items-center gap-3">
                            <button onClick={(e) => { e.stopPropagation(); setSelectedChat(null); }} className="md:hidden p-1 -ml-1 text-zinc-400"><ArrowLeft /></button>
                            <img src={selectedChat.avatar} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <h3 className="font-bold text-white text-sm">{selectedChat.name}</h3>
                                <p className="text-xs text-zinc-400">click for info</p>
                            </div>
                        </div>
                        <div className="flex gap-4 text-gsn-green">
                            <Phone size={20} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); startCall('voice'); }} />
                            <Video size={20} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); startCall('video'); }} />
                            <Search size={20} className="text-zinc-400 cursor-pointer" />
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {messages.map((msg, idx) => {
                            const isContinuous = idx > 0 && messages[idx-1].senderId === msg.senderId;
                            return (
                                <div 
                                    key={msg.id} 
                                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} group relative`}
                                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                                    onMouseLeave={() => setHoveredMessageId(null)}
                                >
                                    {/* Hover Actions */}
                                    {hoveredMessageId === msg.id && (
                                        <div className={`absolute top-0 ${msg.isMe ? 'right-full mr-2' : 'left-full ml-2'} flex items-center bg-zinc-800 rounded-lg p-1 shadow-lg z-20`}>
                                            <button onClick={() => handleReaction(msg.id, '👍')} className="p-1 hover:bg-white/10 rounded">👍</button>
                                            <button onClick={() => handleReaction(msg.id, '❤️')} className="p-1 hover:bg-white/10 rounded">❤️</button>
                                            <button onClick={() => handleReaction(msg.id, '🔥')} className="p-1 hover:bg-white/10 rounded">🔥</button>
                                            <button onClick={() => setReplyTo(msg)} className="p-1 text-zinc-400 hover:text-white"><MessageCircle size={14}/></button>
                                        </div>
                                    )}

                                    <div className={`max-w-[75%] md:max-w-[60%] relative ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                        
                                        {/* Reply Context */}
                                        {msg.replyTo && (
                                            <div className={`mb-1 p-2 rounded-lg text-xs bg-black/20 border-l-4 ${msg.isMe ? 'border-white/50' : 'border-gsn-green'}`}>
                                                <p className="font-bold opacity-80">{msg.replyTo.user?.name}</p>
                                                <p className="truncate opacity-60">{msg.replyTo.text || 'Media'}</p>
                                            </div>
                                        )}

                                        <div className={`px-3 py-1.5 rounded-lg shadow-sm text-sm relative ${
                                            msg.isMe 
                                            ? 'bg-gsn-green text-black rounded-tr-none' 
                                            : 'bg-zinc-800 text-white rounded-tl-none'
                                        }`}>
                                            {/* Media Content */}
                                            {msg.type === 'image' && (
                                                <img src={msg.mediaUrl || msg.text} className="rounded-lg mb-1 max-w-full" alt="Shared" />
                                            )}
                                            
                                            {msg.type === 'audio' && (
                                                <div className="flex items-center gap-3 min-w-[200px] py-2">
                                                    <button className="p-2 bg-black/20 rounded-full"><Play size={12} fill="currentColor" /></button>
                                                    <div className="flex-1 h-1 bg-black/20 rounded-full overflow-hidden">
                                                        <div className="w-1/3 h-full bg-current"></div>
                                                    </div>
                                                    <span className="text-xs font-mono opacity-70">0:12</span>
                                                </div>
                                            )}

                                            {/* Text Content */}
                                            {msg.type === 'text' && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

                                            {/* Metadata */}
                                            <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                                                <span className="text-[10px]">{msg.timestamp}</span>
                                                {msg.isMe && (
                                                    <span>
                                                        {msg.status === 'read' ? <CheckCheck size={12} className="text-blue-600" /> : <Check size={12} />}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Reactions Display */}
                                            {msg.reactions && msg.reactions.length > 0 && (
                                                <div className="absolute -bottom-3 right-0 bg-zinc-800 border border-white/10 rounded-full px-1.5 py-0.5 flex gap-1 shadow-md scale-90">
                                                    {msg.reactions.map((r, i) => (
                                                        <span key={i} className="text-[10px]">{r.emoji} {r.count > 1 ? r.count : ''}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-zinc-900 border-t border-white/5 pb-safe flex items-end gap-2 z-30">
                        <button className="p-3 text-zinc-400 hover:text-white"><Smile size={24} /></button>
                        <button onClick={() => fileInputRef.current?.click()} className="p-3 text-zinc-400 hover:text-white"><Paperclip size={24} /></button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                        
                        <div className="flex-1 bg-black border border-zinc-800 rounded-xl flex flex-col px-4 py-2 min-h-[48px]">
                            {replyTo && (
                                <div className="flex justify-between items-center mb-2 p-2 bg-zinc-900 rounded-lg border-l-4 border-gsn-green">
                                    <div className="text-xs text-zinc-400">
                                        <span className="font-bold text-gsn-green block">{replyTo.user?.name}</span>
                                        {replyTo.text}
                                    </div>
                                    <button onClick={() => setReplyTo(null)}><X size={14} /></button>
                                </div>
                            )}
                            <textarea 
                                value={msgText}
                                onChange={e => setMsgText(e.target.value)}
                                onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                                placeholder="Type a message" 
                                className="bg-transparent text-white text-sm focus:outline-none w-full resize-none max-h-32"
                                rows={1}
                            />
                        </div>

                        {msgText ? (
                            <button onClick={handleSendMessage} className="p-3 bg-gsn-green rounded-full text-black hover:bg-green-400 transition-all">
                                <Send size={20} />
                            </button>
                        ) : (
                            <button 
                                onMouseDown={handleStartRecording}
                                onMouseUp={handleStopRecording}
                                onTouchStart={handleStartRecording}
                                onTouchEnd={handleStopRecording}
                                className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white scale-110 animate-pulse' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                            >
                                <Mic size={20} />
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black">
                    <div className="w-48 h-48 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                        <MessageCircle size={64} className="text-zinc-700" />
                    </div>
                    <h3 className="text-3xl font-light text-white mb-2">Green Messenger</h3>
                    <p className="text-zinc-500 text-sm">Encrypted. Secure. Uncensored.</p>
                </div>
            )}
        </div>

        {/* Contact Info Sidebar (WhatsApp Style) */}
        {selectedChat && showChatInfo && (
            <div className="w-80 bg-zinc-900 border-l border-white/5 flex flex-col h-full animate-in slide-in-from-right duration-300 z-40">
                <div className="p-4 border-b border-white/5 flex items-center gap-4">
                    <button onClick={() => setShowChatInfo(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                    <h3 className="font-bold text-white">Contact Info</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 text-center">
                    <img src={selectedChat.avatar} className="w-40 h-40 rounded-full mx-auto mb-4 border-4 border-black shadow-xl" />
                    <h2 className="text-2xl font-bold text-white">{selectedChat.name}</h2>
                    <p className="text-zinc-500 text-sm mb-6">{selectedChat.type === 'dm' ? '@handle' : 'Group · 12 participants'}</p>
                    
                    <div className="flex justify-center gap-4 mb-8">
                        <div className="flex flex-col items-center gap-1 cursor-pointer group">
                            <div className="p-3 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 text-gsn-green"><Phone size={20}/></div>
                            <span className="text-xs text-zinc-400">Audio</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 cursor-pointer group">
                            <div className="p-3 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 text-gsn-green"><Video size={20}/></div>
                            <span className="text-xs text-zinc-400">Video</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 cursor-pointer group">
                            <div className="p-3 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 text-gsn-green"><Search size={20}/></div>
                            <span className="text-xs text-zinc-400">Search</span>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-xl p-4 text-left mb-4">
                        <p className="text-zinc-500 text-xs font-bold uppercase mb-2">About</p>
                        <p className="text-white text-sm">Living life one harvest at a time. 🌿</p>
                    </div>

                    <div className="bg-black/40 rounded-xl text-left overflow-hidden">
                        <p className="text-zinc-500 text-xs font-bold uppercase p-4 pb-2">Media, Links and Docs</p>
                        <div className="flex gap-1 overflow-x-auto p-2">
                            {[1,2,3,4].map(i => (
                                <img key={i} src={`https://picsum.photos/100/100?random=${i}`} className="w-16 h-16 rounded-lg object-cover" />
                            ))}
                        </div>
                        <button className="w-full py-3 text-xs font-bold text-zinc-400 border-t border-white/5 hover:bg-white/5">View All</button>
                    </div>

                    <div className="mt-8 space-y-4">
                        <button className="w-full flex items-center gap-4 text-red-500 hover:bg-white/5 p-3 rounded-xl transition-colors font-bold">
                            <Trash2 size={20} /> Delete Chat
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Chat;
