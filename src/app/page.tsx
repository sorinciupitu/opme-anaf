import { Header } from '@/components/header';
import { F1129Form } from '@/app/components/f1129-form';

export default function Home() {
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
