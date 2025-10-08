"use client";

import { useEffect, useState } from "react";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";
import { FirebaseContext, FirebaseProviderProps } from "./provider";

interface FirebaseClientProviderProps {
  children: React.ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseClientProviderProps> = ({ children }) => {
  const [firebase, setFirebase] = useState<FirebaseProviderProps | null>(null);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    setFirebase({ app, auth, firestore });
  }, []);

  if (!firebase) {
    return null; // or a loading indicator
  }

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
};
