'use client';

import { useAuth } from '@/firebase/auth/use-auth';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useFirebase } from '@/firebase';
import { UserProfile } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { Spinner } from '@/components/spinner';

function UserManagementTable({ users }: { users: WithId<UserProfile>[] }) {
  const { firestore } = useFirebase();

  const handleUpdateStatus = async (userId: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', userId);
    try {
      await updateDoc(userRef, { status });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Approve or reject new user registrations.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'approved' ? 'default' : user.status === 'pending' ? 'secondary' : 'destructive'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {user.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => handleUpdateStatus(user.id, 'approved')}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(user.id, 'rejected')}>Reject</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { firestore } = useFirebase();

  // Memoize the user profile document reference
  const userProfileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

  // Memoize the users collection reference
  const usersCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersCollectionRef);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!profileLoading && userProfile && userProfile.role !== 'admin') {
      router.push('/');
    }
  }, [user, authLoading, userProfile, profileLoading, router]);
  
  const isLoading = authLoading || profileLoading || usersLoading;

  if (isLoading || !userProfile || userProfile.role !== 'admin') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Spinner />
        <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8">
        <Header />
        <p className="mb-8 text-center text-lg text-muted-foreground">
          Welcome, Admin! Manage user registrations below.
        </p>
        {users && <UserManagementTable users={users} />}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} F1129 Autofill - Admin Panel.
      </footer>
    </div>
  );
}
