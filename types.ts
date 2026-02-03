
export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  email?: string;
  coverImage?: string; 
  verified: boolean;
  role: 'Grower' | 'Smoker' | 'Educator' | 'Brand' | 'Admin' | 'Moderator';
  bio?: string;
  isSubscribed?: boolean; 
  walletBalance?: number; 
  showStonerBadge?: boolean; 
  school?: string;
  business?: string;
  website?: string;
  spotifyPlaylist?: string;
  previousAvatars?: string[]; 
  previousCovers?: string[]; 
}

export interface CommunityChannel {
    id: string;
    name: string;
    type: 'text' | 'voice' | 'announcement';
    description?: string;
}

export interface CommunityEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    attendees: number;
    isAttending: boolean;
    image?: string;
}

export interface PollOption {
    id: string;
    text: string;
    votes: number;
}

export interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    userVotedOptionId?: string;
    endsAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  coverImage: string;
  members: number;
  isJoined: boolean;
  role?: 'admin' | 'moderator' | 'member'; 
  privacy: 'public' | 'private' | 'secret';
  category: 'Growing' | 'Lifestyle' | 'Tech' | 'Local';
  unreadMessages?: number;
  channels: CommunityChannel[];
  inviteLink: string;
  rules?: string[];
  pendingRequests?: number;
  events?: CommunityEvent[];
  pinnedPoll?: Poll;
}

export interface Comment {
  id: string;
  postId: string;
  user: User;
  text: string;
  timestamp: string;
  likes: number;
  replies: number;
  repliesList?: Comment[]; 
  reposts?: number;
  tipAmount?: number; 
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'repost' | 'system' | 'vibe';
  user?: User; 
  text?: string; 
  postImage?: string; 
  timestamp: string;
  read: boolean;
  targetId?: string; // ID of the post, user, or entity to navigate to
}

export interface Post {
  id: string;
  user: User;
  content: string;
  images?: string[]; 
  mediaType?: 'image' | 'video';
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  shares: number;
  timestamp: string;
  tags: string[];
  isMonetized?: boolean; 
  tipAmount?: number; 
  quotedPost?: Post; 
  community?: Community; 
}

export interface VibeOverlay {
    id: string;
    type: 'text' | 'emoji';
    content: string;
    x: number; 
    y: number; 
    style?: string; 
    color?: string;
    scale?: number;
}

export interface Vibe {
  id: string;
  user: User;
  media: string;
  mediaType: 'image' | 'video' | 'text';
  background?: string; 
  overlays: VibeOverlay[];
  caption?: string;
  isSeen: boolean;
  timestamp: string;
}

export interface Reel {
  id: string;
  user: User;
  videoUrl: string;
  caption: string;
  likes: number;
  music: string;
}

export interface Reaction {
    emoji: string;
    count: number;
    userReacted: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  user?: User; 
  replyTo?: Message; 
  channelId?: string;
  type: 'text' | 'image' | 'audio' | 'video';
  mediaUrl?: string;
  duration?: number; // For audio/video
  reactions?: Reaction[];
  status?: 'sent' | 'delivered' | 'read';
}

export interface LinkUpSession {
    id: string;
    user: User;
    latitude: number;
    longitude: number;
    message: string;
    expiresAt: number; 
    activity: 'Chilling' | 'Sesh' | 'Hiking' | 'Food' | 'Gaming';
    distance?: number; 
}

export interface Product {
    id: string;
    seller: User;
    title: string;
    description: string;
    price: number;
    images: string[];
    category: 'Seeds' | 'Equipment' | 'Glass' | 'Merch' | 'Nutrients' | 'Art';
    condition: 'New' | 'Used' | 'Handmade';
    status: 'Available' | 'Sold' | 'Pending';
    location?: string;
    likes: number;
}

export interface AdCampaign {
    id: string;
    userId: string;
    content: string;
    image: string;
    link: string;
    linkText: string;
    durationDays: number;
    cost: number;
    currency: string;
    status: 'Active' | 'Pending' | 'Completed' | 'Draft';
    impressions: number;
    clicks: number;
    startDate: string;
}

export interface GrowLogEntry {
    id: string;
    week: number;
    day: number;
    stage: 'Seedling' | 'Veg' | 'Flower' | 'Harvest' | 'Curing';
    notes: string;
    temp?: number;
    humidity?: number;
    ec?: number;
    ph?: number;
    date: string;
    images?: string[];
}

export interface GrowJournal {
    id: string;
    userId: string;
    user: User;
    title: string;
    strain: string;
    breeder?: string;
    method: 'Hydro' | 'Soil' | 'Coco' | 'Aeroponics';
    startDate: string;
    status: 'Active' | 'Completed' | 'Harvested';
    coverImage: string;
    logs: GrowLogEntry[];
    likes: number;
    views: number;
}

export enum ViewState {
  FEED = 'FEED',
  REELS = 'REELS',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  EXPLORE = 'EXPLORE',
  CREATE = 'CREATE',
  LINKUP = 'LINKUP',
  MARKETPLACE = 'MARKETPLACE',
  ADMIN = 'ADMIN',
  CREATE_REEL = 'CREATE_REEL',
  CREATE_VIBE = 'CREATE_VIBE',
  POST_DETAILS = 'POST_DETAILS',
  NOTIFICATIONS = 'NOTIFICATIONS',
  COMMUNITIES = 'COMMUNITIES',
  EDIT_PROFILE = 'EDIT_PROFILE',
  ADS_MANAGER = 'ADS_MANAGER',
  SETTINGS = 'SETTINGS',
  WALLET = 'WALLET',
  SAVED = 'SAVED',
  GROW_JOURNAL = 'GROW_JOURNAL'
}
