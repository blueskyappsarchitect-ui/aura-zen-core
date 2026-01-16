import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Emergency storage clean - runs once to clear any stale flicker data
const STORAGE_CLEAN_KEY = 'aura_storage_cleaned_v1';
if (!sessionStorage.getItem(STORAGE_CLEAN_KEY)) {
  console.log('[Emergency] Cleaning storage to prevent flicker...');
  // Clear potentially stale auth/UI state
  const keysToPreserve = ['sb-uwubmmbpvyqfbbglfwql-auth-token']; // Preserve Supabase auth
  const localKeys = Object.keys(localStorage);
  const sessionKeys = Object.keys(sessionStorage);
  
  localKeys.forEach(key => {
    if (!keysToPreserve.some(preserve => key.includes(preserve))) {
      localStorage.removeItem(key);
    }
  });
  
  sessionKeys.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  sessionStorage.setItem(STORAGE_CLEAN_KEY, 'true');
  console.log('[Emergency] Storage cleaned.');
}

createRoot(document.getElementById("root")!).render(<App />);
