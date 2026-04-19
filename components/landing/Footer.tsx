import Link from 'next/link';

const Footer = () => (
  <footer className="relative w-full py-10 px-6">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <span className="font-serif font-bold text-foreground">Lighted</span>
        <span className="text-sm text-muted-foreground/60">© {new Date().getFullYear()}</span>
      </div>
      <div className="flex gap-8">
        <Link
          href="/privacy"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Privacy
        </Link>
        <Link
          href="/terms"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Terms
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
