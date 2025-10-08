'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/firebase/auth/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Spinner } from '@/components/spinner';
import { useFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email({ message: 'Adresă de email invalidă.' }),
  password: z.string().min(6, { message: 'Parola trebuie să aibă cel puțin 6 caractere.' }),
});

export function SignUpForm() {
  const { signUpWithEmail, loading: authLoading } = useAuth();
  const { firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Eroare de configurare',
            description: 'Serviciul Firestore nu este disponibil.',
        });
        setIsSubmitting(false);
        return;
    }
    try {
      const user = await signUpWithEmail(values.email, values.password);

      if (user) {
        // Create user profile in Firestore
        const userProfile = {
          email: user.email,
          role: 'user', // Default role
          status: 'pending', // Default status
          createdAt: new Date(),
        };
        
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, userProfile);

        // This is where you set the first user as admin.
        // IMPORTANT: Replace 'PASTE_YOUR_UID_HERE' with your actual User UID from the Firebase Console.
        if (user.uid === 'PASTE_YOUR_UID_HERE') {
             await setDoc(userDocRef, { role: 'admin', status: 'approved' }, { merge: true });
        }
      }


      toast({
        title: 'Cont creat cu succes!',
        description: 'Contul tău este în așteptarea aprobării unui administrator.',
      });
      router.push('/');
    } catch (error: any) {
      let description = 'A apărut o eroare. Te rugăm să încerci din nou.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Acest email este deja folosit. Te rugăm să te autentifici.';
      }
      toast({
        variant: 'destructive',
        title: 'Eroare la crearea contului',
        description,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLoading = authLoading || isSubmitting;

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Creează Cont</CardTitle>
        <CardDescription>
          Introdu email-ul și o parolă pentru a-ți crea un cont nou.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="nume@exemplu.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parola</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2 h-4 w-4" />}
              Creează Cont
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Ai deja cont?{' '}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Autentifică-te
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
