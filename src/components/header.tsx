import { Logo } from '@/components/icons';
import { UserNav } from './user-nav';

export function Header() {
  return (
    <header className="relative flex items-center justify-center gap-4 py-8 text-center md:py-12">
      <Logo className="h-12 w-12 text-primary" />
      <div>
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground md:text-5xl">
          F1129 Autofill
        </h1>
        <p className="text-muted-foreground">O soluție modernă pentru formularele ANAF</p>
      </div>
      <div className="absolute right-0 top-8">
        <UserNav />
      </div>
    </header>
  );
}
