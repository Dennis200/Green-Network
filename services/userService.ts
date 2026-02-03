
import { ref, set, update, onValue, get, child } from "firebase/database";
import { db } from "./firebase";
import { User } from "../types";
import { CURRENT_USER } from "../constants";

export const USERS_COLLECTION = "users";

/**
 * Creates a new user document in Realtime Database.
 * Merges with default mock data to ensure all fields exist.
 */
export const createUserProfile = async (uid: string, data: Partial<User>) => {
    const userRef = ref(db, `${USERS_COLLECTION}/${uid}`);
    
    // We keep CURRENT_USER spread here only as a schema template for new users 
    // to ensure they have all necessary UI fields (like empty arrays for lists)
    const newUser: User = {
        ...CURRENT_USER, 
        id: uid,
        ...data,
        walletBalance: 100, // Default starting balance
        verified: false,
        isAdmin: false,
        isBanned: false,
        role: 'Smoker'
    };

    try {
        await set(userRef, newUser);
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
};

/**
 * Checks if a user profile exists.
 */
export const userProfileExists = async (uid: string): Promise<boolean> => {
    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, `${USERS_COLLECTION}/${uid}`));
        return snapshot.exists();
    } catch (error) {
        console.error("Error checking user profile:", error);
        return false;
    }
};

/**
 * Updates specific fields of a user profile.
 */
export const updateUserProfile = async (uid: string, data: Partial<User>) => {
    const userRef = ref(db, `${USERS_COLLECTION}/${uid}`);
    try {
        await update(userRef, data);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

// --- ADMIN FUNCTIONS ---

export const toggleUserVerification = async (uid: string, currentStatus: boolean) => {
    const userRef = ref(db, `${USERS_COLLECTION}/${uid}`);
    await update(userRef, { verified: !currentStatus });
};

export const toggleUserBan = async (uid: string, currentStatus: boolean) => {
    const userRef = ref(db, `${USERS_COLLECTION}/${uid}`);
    await update(userRef, { isBanned: !currentStatus });
};

export const updateUserRole = async (uid: string, newRole: string, makeAdmin: boolean = false) => {
    const userRef = ref(db, `${USERS_COLLECTION}/${uid}`);
    await update(userRef, { 
        role: newRole,
        isAdmin: makeAdmin 
    });
};

/**
 * Real-time listener for user profile changes.
 */
export const subscribeToUserProfile = (uid: string, onUpdate: (user: User) => void) => {
    const userRef = ref(db, `${USERS_COLLECTION}/${uid}`);
    
    return onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
            onUpdate(snapshot.val() as User);
        } else {
            console.log("No such user data!");
        }
    }, (error) => {
        console.error("Error listening to user profile:", error);
    });
};

/**
 * Real-time listener for ALL users (for Friends/Explore).
 */
export const subscribeToAllUsers = (onUpdate: (users: User[]) => void) => {
    const usersRef = ref(db, USERS_COLLECTION);
    
    return onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const usersArray = Object.values(data) as User[];
            onUpdate(usersArray);
        } else {
            onUpdate([]);
        }
    });
};

/**
 * Helper to fetch multiple user profiles by ID
 */
export const getUsersByIds = async (userIds: string[]): Promise<User[]> => {
    if (!userIds || userIds.length === 0) return [];
    
    const dbRef = ref(db);
    const users: User[] = [];

    // In a real app, you might use a query, but for RTDB loop reads are common for specific ID lists
    // or you fetch all users and filter (if dataset is small).
    // For scalability, individual fetches or a cloud function is better. 
    // Here we use individual fetches for accuracy.
    
    await Promise.all(userIds.map(async (id) => {
        try {
            const snap = await get(child(dbRef, `${USERS_COLLECTION}/${id}`));
            if (snap.exists()) {
                users.push(snap.val());
            }
        } catch (e) {
            console.error(`Failed to fetch user ${id}`, e);
        }
    }));

    return users;
};

/**
 * Get list of users following a specific user
 */
export const getFollowers = async (userId: string): Promise<User[]> => {
    const dbRef = ref(db);
    try {
        const snap = await get(child(dbRef, `followers/${userId}`));
        if (!snap.exists()) return [];
        const ids = Object.keys(snap.val());
        return await getUsersByIds(ids);
    } catch (e) {
        console.error("Error fetching followers", e);
        return [];
    }
};

/**
 * Get list of users a specific user is following
 */
export const getFollowing = async (userId: string): Promise<User[]> => {
    const dbRef = ref(db);
    try {
        const snap = await get(child(dbRef, `following/${userId}`));
        if (!snap.exists()) return [];
        const ids = Object.keys(snap.val());
        return await getUsersByIds(ids);
    } catch (e) {
        console.error("Error fetching following", e);
        return [];
    }
};

/**
 * Algorithm to fetch "Who to follow" recommendations.
 * Factors: Verification status, Shared Role, Random Discovery.
 * Excludes already followed users.
 */
export const getWhoToFollow = async (currentUserId: string): Promise<User[]> => {
    const dbRef = ref(db);
    
    try {
        // 1. Fetch all users
        const usersSnap = await get(child(dbRef, USERS_COLLECTION));
        if (!usersSnap.exists()) return [];
        const allUsers = Object.values(usersSnap.val()) as User[];

        // 2. Fetch current user's following list
        const followingSnap = await get(child(dbRef, `following/${currentUserId}`));
        const followingIds = followingSnap.exists() ? Object.keys(followingSnap.val()) : [];

        // 3. Filter candidates
        const candidates = allUsers.filter(u => u.id !== currentUserId && !followingIds.includes(u.id));

        // 4. Score Candidates (X-like logic)
        const scored = candidates.map(u => {
            let score = Math.random() * 10; // Random baseline for discovery
            if (u.verified) score += 5; // Boost verified users
            if (u.avatar && !u.avatar.includes('ui-avatars')) score += 2; // Boost users with real avatars
            
            // Boost brands or educators slightly for better content mix
            if (u.role === 'Brand' || u.role === 'Educator') score += 3;

            return { user: u, score };
        });

        // 5. Sort by score descending
        scored.sort((a, b) => b.score - a.score);

        // Return top 20, filtering out the score wrapper
        return scored.map(s => s.user).slice(0, 20); 
    } catch (e) {
        console.error("Error fetching recommendations", e);
        return [];
    }
}
