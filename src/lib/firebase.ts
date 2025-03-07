import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDwibENgJ2U1hmQ3JxMVTowA6ywxlUXj_s",
  authDomain: "startups-ad.firebaseapp.com",
  projectId: "startups-ad",
  storageBucket: "startups-ad.firebasestorage.app",
  messagingSenderId: "988591088861",
  appId: "1:988591088861:web:e9e1420edd55cd7e9da734"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
auth.useDeviceLanguage(); // Set language to user's device language

// Initialize and configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  // Allow users to select account every time
  prompt: 'select_account'
});

// Export other services
export const db = getFirestore(app);
export const storage = getStorage(app);
