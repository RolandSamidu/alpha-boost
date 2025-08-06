import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACwHjpbb3y_Ii3485BAxWym7gr5-MW0PU",
  authDomain: "alpha-boost-52c36.firebaseapp.com",
  projectId: "alpha-boost-52c36",
  storageBucket: "alpha-boost-52c36.firebasestorage.app",
  messagingSenderId: "1047255783955",
  appId: "1:1047255783955:android:b6415aaa845a0d84d17de6",
};

const app = initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  console.warn("AsyncStorage persistence failed, using default auth:", error);
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
export default app;
