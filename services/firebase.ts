
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSonfBNlQAgKgqqv_IOmhawx53Ae4Z3KE",
  authDomain: "green-network-bd2a2.firebaseapp.com",
  databaseURL: "https://green-network-bd2a2-default-rtdb.firebaseio.com",
  projectId: "green-network-bd2a2",
  storageBucket: "green-network-bd2a2.firebasestorage.app",
  messagingSenderId: "675279702773",
  appId: "1:675279702773:web:771ef4d2cb51475f9dd3bc",
  measurementId: "G-0T0E0ST1S3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth & Database services
export const auth = getAuth(app);
export const db = getDatabase(app); // Using Realtime Database
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (optional, might fail in some environments without cookies)
let analyticsInstance = null;
try {
    analyticsInstance = getAnalytics(app);
} catch (e) {
    console.log("Analytics not initialized");
}
export const analytics = analyticsInstance;
