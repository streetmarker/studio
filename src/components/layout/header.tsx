import { Logo } from '@/components/icons';

export function Header() {
  return (
    <header className="py-6 sm:py-8">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <Logo className="h-7 w-7 text-foreground sm:h-8 sm:w-8" />
        <h1 className="font-headline text-3xl tracking-wide text-foreground sm:text-4xl">
          PhotoCritique
        </h1>
      </div>
    </header>
  );
}
