
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
    
    const newUser: User = {
        ...CURRENT_USER, // Use mock as default structure
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
