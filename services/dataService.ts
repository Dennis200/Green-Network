
import { ref, push, set, onValue, update, get, remove, child, runTransaction, serverTimestamp } from "firebase/database";
import { db } from "./firebase";
import { Post, Product, Community, User, Message, Notification, Vibe, Comment, LinkUpSession } from "../types";

// Helper to remove undefined fields which Firebase rejects
const sanitizeForFirebase = (obj: any) => {
    const newObj = { ...obj };
    Object.keys(newObj).forEach(key => {
        if (newObj[key] === undefined) {
            delete newObj[key];
        }
    });
    return newObj;
};

// --- POSTS ---

export const createPost = async (postData: Partial<Post>, user: User) => {
    const postsRef = ref(db, 'posts');
    const newPostRef = push(postsRef);
    
    const newPost: Post = {
        id: newPostRef.key!,
        user: user, 
        content: postData.content || '',
        images: postData.images || [],
        likes: 0,
        comments: 0,
        reposts: 0,
        views: 0,
        shares: 0,
        timestamp: new Date().toLocaleDateString(),
        tags: postData.tags || [],
        isMonetized: false,
        ...postData
    };

    await set(newPostRef, sanitizeForFirebase(newPost));
    return newPost;
};

export const subscribeToPosts = (onUpdate: (posts: Post[]) => void) => {
    const postsRef = ref(db, 'posts');
    return onValue(postsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const postsArray = Object.values(data) as Post[];
            onUpdate(postsArray.reverse());
        } else {
            onUpdate([]);
        }
    });
};

export const toggleLikePost = async (postId: string, userId: string, postAuthorId?: string) => {
    const postRef = ref(db, `posts/${postId}`);
    const likeRef = ref(db, `post_likes/${postId}/${userId}`);
    
    const snapshot = await get(likeRef);
    const postSnap = await get(postRef);
    
    if (!postSnap.exists()) return;
    
    const currentLikes = postSnap.val().likes || 0;

    if (snapshot.exists()) {
        await remove(likeRef);
        await update(postRef, { likes: Math.max(0, currentLikes - 1) });
    } else {
        await set(likeRef, true);
        await update(postRef, { likes: currentLikes + 1 });
        
        // Notification
        if (postAuthorId && postAuthorId !== userId) {
            createNotification({
                type: 'like',
                text: 'liked your post',
                postImage: postSnap.val().images?.[0] || undefined,
                targetId: postId
            }, postAuthorId, userId);
        }
    }
};

export const checkIsLiked = async (postId: string, userId: string): Promise<boolean> => {
    const likeRef = ref(db, `post_likes/${postId}/${userId}`);
    const snapshot = await get(likeRef);
    return snapshot.exists();
};

export const incrementView = async (postId: string, userId?: string) => {
    const postRef = ref(db, `posts/${postId}/views`);
    await runTransaction(postRef, (currentViews) => {
        return (currentViews || 0) + 1;
    });
};

export const incrementShare = async (postId: string) => {
    const postRef = ref(db, `posts/${postId}/shares`);
    await runTransaction(postRef, (currentShares) => {
        return (currentShares || 0) + 1;
    });
};

export const repostPost = async (originalPost: Post, user: User, quoteText?: string) => {
    const postData: Partial<Post> = {
        content: quoteText || '',
        quotedPost: originalPost,
        tags: [],
    };
    await createPost(postData, user);

    const originalRef = ref(db, `posts/${originalPost.id}/reposts`);
    await runTransaction(originalRef, (count) => (count || 0) + 1);

    if (originalPost.user.id !== user.id) {
        createNotification({
            type: 'repost',
            text: 'reposted your post',
            postImage: originalPost.images?.[0],
            targetId: originalPost.id
        }, originalPost.user.id, user.id);
    }
};

// --- COMMENTS ---

export const addComment = async (postId: string, text: string, user: User, postAuthorId?: string) => {
    const commentsRef = ref(db, `comments/${postId}`);
    const newCommentRef = push(commentsRef);
    
    const newComment: Comment = {
        id: newCommentRef.key!,
        postId,
        user,
        text,
        timestamp: new Date().toISOString(),
        likes: 0,
        replies: 0
    };

    await set(newCommentRef, sanitizeForFirebase(newComment));

    const postRef = ref(db, `posts/${postId}/comments`);
    await runTransaction(postRef, (count) => (count || 0) + 1);

    if (postAuthorId && postAuthorId !== user.id) {
        createNotification({
            type: 'comment',
            text: `commented: "${text.substring(0, 20)}..."`,
            targetId: postId
        }, postAuthorId, user.id);
    }

    return newComment;
};

export const subscribeToComments = (postId: string, onUpdate: (comments: Comment[]) => void) => {
    const commentsRef = ref(db, `comments/${postId}`);
    return onValue(commentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const commentsArray = Object.values(data) as Comment[];
            onUpdate(commentsArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } else {
            onUpdate([]);
        }
    });
};

// --- FOLLOW SYSTEM ---

export const followUser = async (currentUserId: string, targetUserId: string) => {
    if (currentUserId === targetUserId) return;

    const followingRef = ref(db, `following/${currentUserId}/${targetUserId}`);
    const followersRef = ref(db, `followers/${targetUserId}/${currentUserId}`);

    await set(followingRef, true);
    await set(followersRef, true);

    createNotification({
        type: 'follow',
        text: 'started following you',
        targetId: currentUserId // Navigate to profile who followed
    }, targetUserId, currentUserId);
};

export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
    const followingRef = ref(db, `following/${currentUserId}/${targetUserId}`);
    const followersRef = ref(db, `followers/${targetUserId}/${currentUserId}`);

    await remove(followingRef);
    await remove(followersRef);
};

export const checkIsFollowing = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    const refCheck = ref(db, `following/${currentUserId}/${targetUserId}`);
    const snap = await get(refCheck);
    return snap.exists();
};

export const subscribeToFollowStats = (userId: string, onUpdate: (followers: number, following: number) => void) => {
    const followersRef = ref(db, `followers/${userId}`);
    const followingRef = ref(db, `following/${userId}`);

    const handleUpdate = async () => {
        const followersSnap = await get(followersRef);
        const followingSnap = await get(followingRef);
        onUpdate(
            followersSnap.exists() ? Object.keys(followersSnap.val()).length : 0,
            followingSnap.exists() ? Object.keys(followingSnap.val()).length : 0
        );
    };

    handleUpdate();
    
    const unsub1 = onValue(followersRef, () => handleUpdate());
    const unsub2 = onValue(followingRef, () => handleUpdate());

    return () => {
        unsub1();
        unsub2();
    };
};

// --- MARKETPLACE ---

export const createProduct = async (productData: Partial<Product>, user: User) => {
    const productsRef = ref(db, 'products');
    const newProductRef = push(productsRef);

    const newProduct: Product = {
        id: newProductRef.key!,
        seller: user,
        title: productData.title || 'Untitled',
        description: productData.description || '',
        price: productData.price || 0,
        images: productData.images || [],
        category: productData.category || 'Equipment',
        condition: productData.condition || 'New',
        status: 'Available',
        location: productData.location || 'Online',
        likes: 0
    };

    await set(newProductRef, sanitizeForFirebase(newProduct));
    return newProduct;
};

export const subscribeToProducts = (onUpdate: (products: Product[]) => void) => {
    const productsRef = ref(db, 'products');
    return onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const productsArray = Object.values(data) as Product[];
            onUpdate(productsArray.reverse());
        } else {
            onUpdate([]);
        }
    });
};

// --- COMMUNITIES ---

export const createCommunity = async (communityData: Partial<Community>) => {
    const commRef = ref(db, 'communities');
    const newCommRef = push(commRef);

    const newCommunity: Community = {
        id: newCommRef.key!,
        name: communityData.name || 'Unnamed Community',
        description: communityData.description || '',
        avatar: communityData.avatar || `https://picsum.photos/200/200?random=${Date.now()}`,
        coverImage: communityData.coverImage || `https://picsum.photos/800/300?random=${Date.now()}`,
        members: 1,
        isJoined: true,
        privacy: communityData.privacy || 'public',
        category: communityData.category || 'Growing',
        channels: [
            { id: 'ch_gen', name: 'General', type: 'text' },
            { id: 'ch_ann', name: 'Announcements', type: 'announcement' }
        ],
        inviteLink: `green.app/c/${newCommRef.key}`,
        ...communityData
    };

    await set(newCommRef, sanitizeForFirebase(newCommunity));
    return newCommunity;
};

export const subscribeToCommunities = (onUpdate: (communities: Community[]) => void) => {
    const commRef = ref(db, 'communities');
    return onValue(commRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const commArray = Object.values(data) as Community[];
            onUpdate(commArray.reverse());
        } else {
            onUpdate([]);
        }
    });
};

// --- LINK UP ---

export const createLinkUpSession = async (sessionData: Partial<LinkUpSession>, user: User) => {
    // Store session under userId to enforce one active session per user
    const userSessionRef = ref(db, `linkups/${user.id}`);

    const newSession: LinkUpSession = {
        id: user.id,
        user: user,
        latitude: sessionData.latitude || 0,
        longitude: sessionData.longitude || 0,
        message: sessionData.message || '',
        expiresAt: sessionData.expiresAt || (Date.now() + 3600000), // Default 1 hour if not specified
        activity: sessionData.activity || 'Sesh',
        // Distance is calculated on client side based on viewer's location
    };

    await set(userSessionRef, sanitizeForFirebase(newSession));
    return newSession;
};

export const stopLinkUpSession = async (userId: string) => {
    const sessionRef = ref(db, `linkups/${userId}`);
    await remove(sessionRef);
};

export const subscribeToLinkUps = (onUpdate: (sessions: LinkUpSession[]) => void) => {
    const linkupsRef = ref(db, 'linkups');
    return onValue(linkupsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const sessions = Object.values(data) as LinkUpSession[];
            // Filter out expired sessions on client side for immediate UI update, 
            // though backend cleanup is recommended for persistent data
            const activeSessions = sessions.filter(s => s.expiresAt > Date.now());
            onUpdate(activeSessions);
        } else {
            onUpdate([]);
        }
    });
};

// --- MESSENGER ---

export const startChat = async (currentUser: User, otherUser: User) => {
    const chatsRef = ref(db, 'chats');
    const newChatRef = push(chatsRef);
    
    const newChat = {
        id: newChatRef.key!,
        type: 'dm',
        members: { [currentUser.id]: true, [otherUser.id]: true },
        memberDetails: [currentUser, otherUser], 
        lastMessage: 'Chat started',
        timestamp: new Date().toISOString(),
        unread: { [otherUser.id]: 1 }
    };

    await set(newChatRef, sanitizeForFirebase(newChat));
    return newChat;
};

export const sendMessage = async (chatId: string, content: string, sender: User, type: 'text'|'image'|'audio'|'video' = 'text', replyTo?: Message, duration?: number) => {
    const messagesRef = ref(db, `messages/${chatId}`);
    const newMessageRef = push(messagesRef);
    const timestamp = new Date().toISOString();

    const newMessage: Message = {
        id: newMessageRef.key!,
        senderId: sender.id,
        text: type === 'text' ? content : (type === 'audio' ? 'Audio Message' : 'Image'),
        mediaUrl: type !== 'text' ? content : undefined,
        type: type,
        duration: duration,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isMe: true, 
        user: sender,
        replyTo: replyTo,
        status: 'sent'
    };

    await set(newMessageRef, sanitizeForFirebase(newMessage));

    const chatRef = ref(db, `chats/${chatId}`);
    await update(chatRef, {
        lastMessage: type === 'text' ? content : `Sent ${type}`,
        timestamp: timestamp
    });
};

export const subscribeToChats = (userId: string, onUpdate: (chats: any[]) => void) => {
    const chatsRef = ref(db, 'chats');
    return onValue(chatsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const allChats = Object.values(data);
            const myChats = allChats.filter((c: any) => c.members && c.members[userId]);
            onUpdate(myChats.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } else {
            onUpdate([]);
        }
    });
};

export const subscribeToMessages = (chatId: string, onUpdate: (messages: Message[]) => void) => {
    const messagesRef = ref(db, `messages/${chatId}`);
    return onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const msgs = Object.values(data) as Message[];
            onUpdate(msgs);
        } else {
            onUpdate([]);
        }
    });
};

// --- NOTIFICATIONS ---

export const createNotification = async (notifData: Partial<Notification>, recipientId: string, senderId?: string) => {
    const notifRef = ref(db, `notifications/${recipientId}`);
    const newNotifRef = push(notifRef);
    
    let user = notifData.user;
    if (senderId && !user) {
        const uSnap = await get(ref(db, `users/${senderId}`));
        if (uSnap.exists()) user = uSnap.val();
    }

    const newNotif: Notification = {
        id: newNotifRef.key!,
        timestamp: 'Just now',
        read: false,
        type: 'system', // default
        targetId: '', // Default empty if not provided
        ...notifData,
        user: user || notifData.user
    };

    await set(newNotifRef, sanitizeForFirebase(newNotif));
};

export const subscribeToNotifications = (userId: string, onUpdate: (notifs: Notification[]) => void) => {
    const notifRef = ref(db, `notifications/${userId}`);
    return onValue(notifRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const notifs = Object.values(data) as Notification[];
            onUpdate(notifs.reverse());
        } else {
            onUpdate([]);
        }
    });
};

export const markNotificationRead = async (userId: string, notificationId: string) => {
    const notifRef = ref(db, `notifications/${userId}/${notificationId}`);
    await update(notifRef, { read: true });
};

export const markAllNotificationsRead = async (userId: string) => {
    const notifRef = ref(db, `notifications/${userId}`);
    const snapshot = await get(notifRef);
    
    if (snapshot.exists()) {
        const updates: any = {};
        snapshot.forEach((childSnapshot) => {
            if (!childSnapshot.val().read) {
                updates[`${childSnapshot.key}/read`] = true;
            }
        });
        if (Object.keys(updates).length > 0) {
            await update(notifRef, updates);
        }
    }
};

// --- VIBES ---

export const createVibe = async (vibeData: Partial<Vibe>, user: User) => {
    const vibesRef = ref(db, 'vibes');
    const newVibeRef = push(vibesRef);

    const newVibe: Vibe = {
        id: newVibeRef.key!,
        user: user,
        media: 'https://picsum.photos/400/800', 
        mediaType: 'image',
        overlays: [],
        isSeen: false,
        timestamp: 'Just now',
        ...vibeData
    };

    await set(newVibeRef, sanitizeForFirebase(newVibe));
};

export const subscribeToVibes = (onUpdate: (vibes: Vibe[]) => void) => {
    const vibesRef = ref(db, 'vibes');
    return onValue(vibesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const vibes = Object.values(data) as Vibe[];
            onUpdate(vibes.reverse());
        } else {
            onUpdate([]);
        }
    });
};
