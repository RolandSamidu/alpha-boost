import { auth } from "./config/firebaseConfig.js";

// Test Firebase configuration
console.log("Testing Firebase configuration...");

try {
  console.log("Firebase Auth initialized:", !!auth);
  console.log("Auth app name:", auth.app.name);
  console.log("Auth project ID:", auth.app.options.projectId);
  console.log("Auth domain:", auth.app.options.authDomain);

  // Test auth state listener
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("User is signed in:", user.email);
    } else {
      console.log("User is signed out");
    }
    unsubscribe(); // Clean up
  });

  console.log("Firebase configuration test completed successfully!");
} catch (error) {
  console.error("Firebase configuration error:", error);
}
