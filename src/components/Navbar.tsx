"use client";
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { Github, Linkedin, Twitter } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-500 dark:from-blue-400 dark:to-pink-400 hover:scale-105 transition-transform">
              Alper.
            </Link>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Link href="https://github.com" target="_blank" className="hover:text-pink-500 dark:hover:text-pink-400 transition-colors"><Github className="w-5 h-5"/></Link>
              <Link href="https://linkedin.com" target="_blank" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"><Linkedin className="w-5 h-5"/></Link>
              <Link href="https://twitter.com" target="_blank" className="hover:text-blue-400 dark:hover:text-blue-300 transition-colors"><Twitter className="w-5 h-5"/></Link>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
