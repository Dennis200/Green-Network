
import { Post, Reel, Vibe, User, Message, LinkUpSession, Comment, Notification, Community, Product, GrowJournal } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Kush Master',
  handle: '@kush_master_420',
  avatar: 'https://picsum.photos/150/150?random=1',
  coverImage: 'https://picsum.photos/1200/400?random=1',
  verified: true,
  role: 'Grower',
  bio: 'Living life one harvest at a time. 🌿 | Hydroponics Expert',
  walletBalance: 2500, // Starting "Seeds" balance
  showStonerBadge: false,
  school: 'Oaksterdam University',
  business: 'High Grade Hydro',
  website: 'https://www.greenstoners.com',
  spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
  previousAvatars: [
      'https://picsum.photos/150/150?random=99',
      'https://picsum.photos/150/150?random=98',
      'https://picsum.photos/150/150?random=97'
  ],
  previousCovers: [
      'https://picsum.photos/1200/400?random=96',
      'https://picsum.photos/1200/400?random=95'
  ]
};

const OTHER_USERS: User[] = [
  { id: 'u2', name: 'Sativa Diva', handle: '@sativa_diva', avatar: 'https://picsum.photos/150/150?random=2', verified: false, role: 'Smoker', bio: 'Sativa lover. Creative vibes only. 🎨✨' },
  { id: 'u3', name: 'Dr. Greenthumb', handle: '@dr_green', avatar: 'https://picsum.photos/150/150?random=3', verified: true, role: 'Educator', bio: 'PhD in Botany. Teaching the world to grow.' },
  { id: 'u4', name: 'Top Shelf', handle: '@topshelf', avatar: 'https://picsum.photos/150/150?random=4', verified: false, role: 'Brand', bio: 'Premium genetics and nutrients.' },
  { id: 'u5', name: 'Canna Tech', handle: '@cannatech', avatar: 'https://picsum.photos/150/150?random=5', verified: true, role: 'Brand', bio: 'The future of cultivation technology.' },
  { id: 'u6', name: 'Trichome King', handle: '@trichome_king', avatar: 'https://picsum.photos/150/150?random=6', verified: false, role: 'Grower', bio: 'Chasing the frostiest nugs. ❄️' },
];

export const MOCK_USERS = [CURRENT_USER, ...OTHER_USERS];

export const getUserById = (id: string): User | undefined => {
    return MOCK_USERS.find(u => u.id === id);
};

export const MOCK_COMMUNITIES: Community[] = [
    { 
        id: 'com1', 
        name: 'Denver Growers Collective', 
        description: 'Local growers sharing tips, swap meets, and genetics in the Mile High City.', 
        avatar: 'https://picsum.photos/200/200?random=100', 
        coverImage: 'https://picsum.photos/800/300?random=101',
        members: 1240, 
        isJoined: true, 
        role: 'member',
        privacy: 'public',
        category: 'Local',
        unreadMessages: 5,
        inviteLink: 'green.app/c/denver-growers',
        channels: [
            { id: 'ch1', name: 'General Chat', type: 'text' },
            { id: 'ch2', name: 'Marketplace', type: 'text' },
            { id: 'ch3', name: 'Events', type: 'announcement' }
        ],
        rules: ['No selling illegal substances', 'Be respectful', 'Keep it local']
    },
    { 
        id: 'com2', 
        name: 'Hydroponics Mastery', 
        description: 'Advanced DWC, NFT, and Aeroponics discussions. No soil allowed! 💧', 
        avatar: 'https://picsum.photos/200/200?random=102', 
        coverImage: 'https://picsum.photos/800/300?random=103',
        members: 8500, 
        isJoined: true, 
        role: 'admin',
        privacy: 'public',
        category: 'Growing',
        unreadMessages: 0,
        inviteLink: 'green.app/c/hydro-mastery',
        channels: [
            { id: 'ch4', name: 'Announcements', type: 'announcement' },
            { id: 'ch5', name: 'Troubleshooting', type: 'text' },
            { id: 'ch6', name: 'Setup Showcase', type: 'text' }
        ],
        pendingRequests: 12
    },
    { 
        id: 'com3', 
        name: 'Secret Breeders Club', 
        description: 'Invite only. High end genetics discussion.', 
        avatar: 'https://picsum.photos/200/200?random=104', 
        coverImage: 'https://picsum.photos/800/300?random=105',
        members: 45, 
        isJoined: false, 
        privacy: 'secret',
        category: 'Tech',
        inviteLink: 'green.app/c/x8s9d0',
        channels: [
            { id: 'ch7', name: 'Main', type: 'text' }
        ]
    },
    { 
        id: 'com4', 
        name: 'Cannabis Tech & Automation', 
        description: 'The intersection of technology, automation, and cultivation.', 
        avatar: 'https://picsum.photos/200/200?random=106', 
        coverImage: 'https://picsum.photos/800/300?random=107',
        members: 320, 
        isJoined: false, 
        privacy: 'private',
        category: 'Tech',
        inviteLink: 'green.app/c/canna-tech',
        channels: [
            { id: 'ch8', name: 'General', type: 'text' }
        ]
    }
];

export const MOCK_VIBES: Vibe[] = [
  { 
      id: 'v1', 
      user: MOCK_USERS[1], // Sativa Diva
      media: 'https://picsum.photos/400/800?random=1', 
      mediaType: 'image',
      isSeen: false, 
      timestamp: '2h',
      caption: 'Morning energy ✨',
      overlays: [
          { id: 'ov1', type: 'text', content: 'Wake & Bake', x: 50, y: 20, style: 'neon', color: '#4ade80' }
      ]
  },
  { 
      id: 'v1_2', 
      user: MOCK_USERS[1], // Sativa Diva
      media: 'https://picsum.photos/400/800?random=111', 
      mediaType: 'image',
      isSeen: false, 
      timestamp: '1h',
      caption: 'Art flow today',
      overlays: []
  },
  { 
      id: 'v2', 
      user: MOCK_USERS[2], // Dr. Green
      media: 'https://picsum.photos/400/800?random=2', 
      mediaType: 'image',
      isSeen: false, 
      timestamp: '4h',
      caption: 'Lab results are in 📈',
      overlays: [
          { id: 'ov2', type: 'emoji', content: '🔥', x: 80, y: 80, scale: 2 }
      ]
  },
  { 
      id: 'v3', 
      user: MOCK_USERS[3], // Top Shelf
      media: '', 
      mediaType: 'text',
      background: 'bg-gradient-to-br from-purple-600 to-blue-900',
      isSeen: true, 
      timestamp: '6h',
      caption: '',
      overlays: [
          { id: 'ov3', type: 'text', content: 'New drop tomorrow at noon!', x: 50, y: 50, style: 'bold', color: '#ffffff', scale: 1.5 }
      ]
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    user: MOCK_USERS[2],
    content: 'Just flipped the lights to 12/12. The stretch is about to get crazy! 🌱 Who else is starting their flower cycle this week? #GrowTips #Flowering',
    images: ['https://picsum.photos/800/600?random=10', 'https://picsum.photos/800/600?random=99'],
    likes: 420,
    comments: 68,
    reposts: 12,
    views: 1200,
    shares: 45,
    timestamp: '2h',
    tags: ['GrowTips', 'Flowering'],
    isMonetized: true,
    tipAmount: 1500,
    community: MOCK_COMMUNITIES[0] // Posted in Denver Growers
  },
  {
    id: 'p2',
    user: MOCK_USERS[1],
    content: 'Morning wake and bake. 💜 The terpene profile on this batch is insane. Lemon and berries all day.',
    likes: 128,
    comments: 15,
    reposts: 3,
    views: 450,
    shares: 12,
    timestamp: '4h',
    tags: ['WakeAndBake', 'Terpenes']
  },
  {
    id: 'p3',
    user: MOCK_USERS[4],
    content: 'Our new LED spectrum analysis is out. Optimizing your red light intake during late bloom is crucial for density. Link in bio.',
    images: ['https://picsum.photos/800/400?random=11', 'https://picsum.photos/800/800?random=12', 'https://picsum.photos/800/800?random=13', 'https://picsum.photos/800/800?random=14', 'https://picsum.photos/800/800?random=15'],
    likes: 890,
    comments: 120,
    reposts: 450,
    views: 5600,
    shares: 120,
    timestamp: '6h',
    tags: ['Tech', 'LED'],
    isMonetized: true,
    tipAmount: 5000,
    community: MOCK_COMMUNITIES[1] // Posted in Hydroponics Mastery
  },
  {
    id: 'p4',
    user: MOCK_USERS[1], // Sativa Diva
    content: 'Painting and puffing today. 🎨💨 This Sour Diesel got the creative juices flowing!',
    images: ['https://picsum.photos/800/800?random=40'],
    likes: 210,
    comments: 34,
    reposts: 5,
    views: 890,
    shares: 8,
    timestamp: '8h',
    tags: ['Art', 'Sativa', 'Creative']
  },
  {
    id: 'p5',
    user: MOCK_USERS[5], // Trichome King
    content: 'Macro shot of the Strawberry Cough. 🍓 Milky trichomes everywhere. Harvest in 3 days.',
    images: ['https://picsum.photos/800/600?random=41'],
    likes: 1205,
    comments: 89,
    reposts: 150,
    views: 3400,
    shares: 210,
    timestamp: '10h',
    tags: ['Macro', 'Trichomes', 'Harvest']
  },
  {
    id: 'p6',
    user: MOCK_USERS[2], // Dr. Greenthumb
    content: 'PSA: Always calibrate your pH pens! A drift of 0.5 can lock out essential micronutrients like Iron and Manganese. 📉',
    likes: 560,
    comments: 45,
    reposts: 200,
    views: 2100,
    shares: 150,
    timestamp: '12h',
    tags: ['GrowTips', 'Science', 'pH']
  },
  {
    id: 'p7',
    user: CURRENT_USER, // Kush Master
    content: 'Facts. Lost a whole crop to pH drift back in \'18. Never again.',
    likes: 89,
    comments: 12,
    reposts: 2,
    views: 320,
    shares: 5,
    timestamp: '11h',
    tags: ['GrowLife'],
    quotedPost: {
        id: 'p6',
        user: MOCK_USERS[2],
        content: 'PSA: Always calibrate your pH pens! A drift of 0.5 can lock out essential micronutrients like Iron and Manganese. 📉',
        likes: 560,
        comments: 45,
        reposts: 200,
        views: 2100,
        shares: 150,
        timestamp: '12h',
        tags: ['GrowTips', 'Science', 'pH'],
        images: []
    }
  },
  {
    id: 'p8',
    user: MOCK_USERS[3], // Top Shelf
    content: 'Flash Sale! 🚨 50% off all nutrient starter kits for the next 24 hours. Get your grow started right.',
    images: ['https://picsum.photos/800/400?random=42'],
    likes: 340,
    comments: 22,
    reposts: 80,
    views: 1500,
    shares: 40,
    timestamp: '1d',
    tags: ['Sale', 'Nutrients'],
    isMonetized: true,
    tipAmount: 0
  },
  {
    id: 'p9',
    user: MOCK_USERS[4], // Canna Tech
    content: 'Just installed the new automated fertigation system. Controlling EC/pH from my phone while on vacation. 📱✈️',
    images: ['https://picsum.photos/800/500?random=43', 'https://picsum.photos/800/500?random=44'],
    likes: 890,
    comments: 115,
    reposts: 67,
    views: 2800,
    shares: 55,
    timestamp: '1d',
    tags: ['Automation', 'Hydroponics', 'Tech'],
    community: MOCK_COMMUNITIES[3] // Canna Tech & AI
  },
  {
    id: 'p10',
    user: MOCK_USERS[1], // Sativa Diva
    content: 'When you drop the grinder on the carpet... 😭💀 #StonerProblems',
    likes: 4500,
    comments: 320,
    reposts: 1200,
    views: 15000,
    shares: 500,
    timestamp: '1d',
    tags: ['Relatable', 'Fail']
  },
  {
    id: 'p11',
    user: MOCK_USERS[5], // Trichome King
    content: 'Drying room conditions dialed in. 60F / 60% RH. The slow dry is key to preserving those terps. 🗝️',
    likes: 670,
    comments: 56,
    reposts: 34,
    views: 1900,
    shares: 25,
    timestamp: '2d',
    tags: ['Drying', 'Curing', 'Terpenes']
  },
  {
    id: 'p12',
    user: MOCK_USERS[2], // Dr. Greenthumb
    content: 'Big shoutout to the Denver Growers Collective for hosting an amazing swap meet yesterday! Got some rare cuts. ✂️',
    likes: 320,
    comments: 28,
    reposts: 15,
    views: 800,
    shares: 10,
    timestamp: '2d',
    tags: ['Community', 'Clones'],
    community: MOCK_COMMUNITIES[0] // Denver Growers
  },
  {
    id: 'p13',
    user: CURRENT_USER, // Kush Master
    content: 'Sunset session. Nature is the best setting. 🏔️☀️',
    images: ['https://picsum.photos/800/1000?random=45'],
    likes: 150,
    comments: 10,
    reposts: 1,
    views: 400,
    shares: 3,
    timestamp: '3d',
    tags: ['Outdoors', 'Vibes']
  }
];

export const MOCK_COMMENTS: Comment[] = [
    { 
        id: 'c1', 
        postId: 'p1', 
        user: MOCK_USERS[1], 
        text: 'Good luck! Keep an eye on the humidity during the stretch.', 
        timestamp: '1h', 
        likes: 24, 
        replies: 2, 
        tipAmount: 50,
        repliesList: [
            {
                id: 'c1_r1',
                postId: 'p1',
                user: MOCK_USERS[2], // Dr Green
                text: 'Agreed. VPD is crucial right now.',
                timestamp: '45m',
                likes: 5,
                replies: 0,
                repliesList: []
            },
            {
                id: 'c1_r2',
                postId: 'p1',
                user: CURRENT_USER,
                text: 'Thanks! Dialing in the dehumidifier as we speak.',
                timestamp: '30m',
                likes: 3,
                replies: 0,
                repliesList: []
            }
        ]
    },
    { 
        id: 'c2', 
        postId: 'p1', 
        user: MOCK_USERS[4], 
        text: 'Looking healthy! What nutrients are you running?', 
        timestamp: '30m', 
        likes: 12, 
        replies: 1,
        repliesList: [
             {
                id: 'c2_r1',
                postId: 'p1',
                user: MOCK_USERS[5],
                text: 'Looks like Athena Pro Line to me based on the leaf color.',
                timestamp: '10m',
                likes: 8,
                replies: 0,
                repliesList: []
            }
        ]
    },
    { id: 'c3', postId: 'p1', user: MOCK_USERS[5], text: 'That canopy is looking uniform. Nice work with the LST.', timestamp: '10m', likes: 5, replies: 0, tipAmount: 100 },
    { id: 'c4', postId: 'p2', user: MOCK_USERS[2], text: 'Nothing beats lemon terps in the morning 🍋', timestamp: '2h', likes: 10, replies: 0 },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'n1', type: 'like', user: MOCK_USERS[1], postImage: 'https://picsum.photos/50/50?random=10', timestamp: '2m', read: false },
    { id: 'n2', type: 'vibe', user: MOCK_USERS[4], text: 'liked your vibe', timestamp: '15m', read: false },
    { id: 'n3', type: 'comment', user: MOCK_USERS[2], text: 'That canopy is looking uniform. Nice work...', postImage: 'https://picsum.photos/50/50?random=10', timestamp: '1h', read: true },
    { id: 'n4', type: 'mention', user: MOCK_USERS[5], text: 'mentioned you in a post', timestamp: '3h', read: true },
    { id: 'n5', type: 'system', text: 'Welcome to Green Stoners Network! Complete your profile to get verified.', timestamp: '1d', read: true },
];

export const MOCK_REELS: Reel[] = [
  {
    id: 'r1',
    user: MOCK_USERS[5],
    videoUrl: 'https://picsum.photos/400/800?random=20', // Placeholder
    caption: 'Look at the frost on these buds! ❄️🥶 #Frosty #Harvest',
    likes: 1500,
    music: 'Original Audio - Trichome King'
  },
  {
    id: 'r2',
    user: MOCK_USERS[1],
    videoUrl: 'https://picsum.photos/400/800?random=21',
    caption: 'Rolling the perfect joint tutorial. 💨✨ #RollUp',
    likes: 3200,
    music: 'Lofi Chill Beats'
  }
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'u3', text: 'Hey man, what nutrients are you running right now?', timestamp: '10:30 AM', isMe: false, type: 'text' },
  { id: 'm2', senderId: 'u1', text: 'Im running the new organic line from BioCanna. Results are fire.', timestamp: '10:32 AM', isMe: true, type: 'text' },
  { id: 'm3', senderId: 'u3', text: 'Nice, I might switch next run.', timestamp: '10:33 AM', isMe: false, type: 'text' },
];

export const MOCK_COMMUNITY_MESSAGES: Message[] = [
    { id: 'cm1', senderId: 'u2', user: MOCK_USERS[1], text: 'Has anyone seen the new pH pens at the shop?', timestamp: '09:41 AM', isMe: false, channelId: 'ch1', type: 'text' },
    { id: 'cm2', senderId: 'u4', user: MOCK_USERS[3], text: 'Yeah, they are overpriced. Stick to BlueLab.', timestamp: '09:45 AM', isMe: false, channelId: 'ch1', type: 'text', replyTo: { id: 'cm1', senderId: 'u2', user: MOCK_USERS[1], text: 'Has anyone seen the new pH pens at the shop?', timestamp: '09:41 AM', isMe: false, type: 'text' } },
    { id: 'cm3', senderId: 'u1', text: 'Agreed. Quality over hype.', timestamp: '09:50 AM', isMe: true, channelId: 'ch1', type: 'text' },
    { id: 'cm4', senderId: 'u3', user: MOCK_USERS[2], text: 'The Expo is this Saturday!', timestamp: '10:00 AM', isMe: false, channelId: 'ch3', type: 'text' },
]

export const MOCK_LINKUPS: LinkUpSession[] = [
    { id: 'l1', user: MOCK_USERS[1], latitude: 39.7392, longitude: -104.9903, message: 'Smoking at the park 🌳', expiresAt: Date.now() + 3600000, activity: 'Sesh', distance: 1.2 },
    { id: 'l2', user: MOCK_USERS[2], latitude: 39.7400, longitude: -104.9800, message: 'Grow advice & coffee ☕️', expiresAt: Date.now() + 7200000, activity: 'Chilling', distance: 2.5 },
    { id: 'l3', user: MOCK_USERS[5], latitude: 39.7500, longitude: -105.0000, message: 'Showing off the new harvest! ✂️', expiresAt: Date.now() + 1800000, activity: 'Sesh', distance: 4.8 },
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'prod1',
        seller: MOCK_USERS[4], // Top Shelf
        title: 'Premium LED Grow Light 600W',
        description: 'Full spectrum 600W LED panel. Perfect for a 4x4 tent. Used for one cycle, like new.',
        price: 250,
        images: ['https://picsum.photos/600/600?random=300', 'https://picsum.photos/600/600?random=301'],
        category: 'Equipment',
        condition: 'Used',
        status: 'Available',
        location: 'Denver, CO',
        likes: 12
    },
    {
        id: 'prod2',
        seller: MOCK_USERS[3], // Dr. Greenthumb
        title: 'Rare Sativa Genetics - 10 Pack',
        description: 'Exclusive landrace Sativa seeds. High yield, long flowering time. For experienced growers.',
        price: 120,
        images: ['https://picsum.photos/600/600?random=302'],
        category: 'Seeds',
        condition: 'New',
        status: 'Available',
        location: 'California',
        likes: 45
    },
    {
        id: 'prod3',
        seller: MOCK_USERS[1], // Sativa Diva
        title: 'Handblown Galaxy Bong',
        description: 'Beautiful 12 inch beaker bong with galaxy swirls. Custom made.',
        price: 300,
        images: ['https://picsum.photos/600/600?random=303', 'https://picsum.photos/600/600?random=304'],
        category: 'Glass',
        condition: 'New',
        status: 'Available',
        location: 'Oregon',
        likes: 89
    },
    {
        id: 'prod4',
        seller: MOCK_USERS[2], // Kush Master
        title: 'Trim Bin - Ergonomic',
        description: 'Save your back and collect kief. Cleaned and sterilized.',
        price: 40,
        images: ['https://picsum.photos/600/600?random=305'],
        category: 'Equipment',
        condition: 'Used',
        status: 'Available',
        location: 'Denver, CO',
        likes: 5
    },
    {
        id: 'prod5',
        seller: MOCK_USERS[5], // Canna Tech
        title: 'Automated Drip System Kit',
        description: 'Complete irrigation kit for 6 plants. Wifi controller included.',
        price: 180,
        images: ['https://picsum.photos/600/600?random=306'],
        category: 'Equipment',
        condition: 'New',
        status: 'Available',
        location: 'Washington',
        likes: 22
    }
];

// Admin Dashboard Mock Data
export const MOCK_ADMIN_STATS = [
    { label: 'Total Users', value: '45.2k', change: '+12%', isPositive: true },
    { label: 'Active Today', value: '8.1k', change: '+5%', isPositive: true },
    { label: 'Revenue', value: '$124k', change: '+18%', isPositive: true },
    { label: 'Pending Reports', value: '23', change: '-4%', isPositive: false },
];

export const MOCK_REPORTS = [
    { id: 'r1', type: 'Post', reason: 'Spam/Bot', user: 'User123', status: 'Pending', date: '10m ago' },
    { id: 'r2', type: 'Comment', reason: 'Harassment', user: 'Troll420', status: 'Pending', date: '2h ago' },
    { id: 'r3', type: 'User', reason: 'Fake Profile', user: 'ScammerX', status: 'Reviewed', date: '1d ago' },
];

// Mock Journals
export const MOCK_JOURNALS: GrowJournal[] = [
    {
        id: 'j1',
        userId: CURRENT_USER.id,
        user: CURRENT_USER,
        title: 'Gorilla Glue #4 - First Hydro Run',
        strain: 'Gorilla Glue #4',
        breeder: 'GG Strains',
        method: 'Hydro',
        startDate: '2023-09-15',
        status: 'Active',
        coverImage: 'https://picsum.photos/800/600?random=201',
        likes: 124,
        views: 1205,
        logs: [
            {
                id: 'l1',
                week: 1,
                day: 3,
                stage: 'Seedling',
                notes: 'Seeds popped! Transferred to rockwool cubes. keeping humidity high.',
                temp: 78,
                humidity: 75,
                date: 'Sep 18',
                images: ['https://picsum.photos/300/300?random=202']
            },
            {
                id: 'l2',
                week: 2,
                day: 10,
                stage: 'Veg',
                notes: 'First set of true leaves showing. Started light nutrient feed (0.8 EC).',
                temp: 76,
                humidity: 65,
                ec: 0.8,
                ph: 5.8,
                date: 'Sep 25',
                images: ['https://picsum.photos/300/300?random=203']
            }
        ]
    },
    {
        id: 'j2',
        userId: CURRENT_USER.id,
        user: CURRENT_USER,
        title: 'Blue Dream - Living Soil',
        strain: 'Blue Dream',
        breeder: 'Humboldt Seed Org',
        method: 'Soil',
        startDate: '2023-08-01',
        status: 'Active',
        coverImage: 'https://picsum.photos/800/600?random=204',
        likes: 89,
        views: 850,
        logs: [
            {
                id: 'l3',
                week: 8,
                day: 56,
                stage: 'Flower',
                notes: 'Week 3 of flower. Stretch is over. Buds starting to stack.',
                temp: 75,
                humidity: 50,
                date: 'Oct 20',
                images: ['https://picsum.photos/300/300?random=205', 'https://picsum.photos/300/300?random=206']
            }
        ]
    }
];
