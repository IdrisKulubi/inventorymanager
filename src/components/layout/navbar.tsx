export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md transition-all dark:bg-gray-950/75">
      <div className="container flex h-14 items-center">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-700 via-amber-500 to-amber-800 bg-clip-text text-transparent dark:from-amber-200 dark:via-amber-400 dark:to-amber-300">
          The Chocolate Room
        </h1>
      </div>
    </nav>
  );
}