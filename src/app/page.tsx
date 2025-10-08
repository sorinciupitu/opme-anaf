'use client';

import { useAuth } from '@/firebase/auth/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Header } from '@/components/header';
import { F1129Form } from '@/app/components/f1129-form';
import { Spinner } from '@/components/spinner';
import { useFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/lib/definitions';
import { Button } from '@/components/ui/button';

function PendingApproval() {
  const { signOut } = useAuth();
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-2xl font-headline">Contul este în așteptare</h1>
        <p className="text-muted-foreground">Contul tău a fost creat, dar trebuie aprobat de un administrator.</p>
        <p className="text-muted-foreground">Vei primi o notificare pe email când statusul se schimbă. Mulțumim pentru răbdare!</p>
        <Button onClick={signOut}>Deconectare</Button>
    </div>
  )
}

function Rejected() {
  const { signOut } = useAuth();
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-2xl font-headline text-destructive">Cont respins</h1>
        <p className="text-muted-foreground">Din păcate, cererea ta de înregistrare a fost respinsă.</p>
        <Button onClick={signOut}>Deconectare</Button>
    </div>
  )
}


export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const { firestore } = useFirebase();

  const userProfileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const isLoading = authLoading || profileLoading;

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (userProfile?.status === 'pending') {
    return <PendingApproval />;
  }

  if (userProfile?.status === 'rejected') {
    return <Rejected />;
  }
  
  if (userProfile?.status !== 'approved') {
     return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Spinner />
        <p className="mt-4 text-muted-foreground">Verifying account status...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8">
        <Header />
        <p className="mb-8 text-center text-lg text-muted-foreground">
          Completați automat formularul F1129 prin importul unui fișier XML existent sau prin introducerea manuală a datelor.
        </p>
        <F1129Form />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} F1129 Autofill. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
