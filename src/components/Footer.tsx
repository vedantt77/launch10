

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Built with ❤️ by{' '}
          <a
            href="https://x.com/KambliVedant"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            Vedant
          </a>
        </p>
      </div>
    </footer>
  );
}