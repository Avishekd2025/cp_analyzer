"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain,
  Layers,
  GitFork,
  RefreshCw,
  Award,
  BookOpen,
  Share2,
  HelpCircle,
  ExternalLink,
  Search,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Universe", href: "/", icon: Brain },
    { name: "Patterns", href: "/patterns", icon: Layers },
    { name: "Knowledge Graph", href: "/graph", icon: Share2 },
    { name: "200-Segments", href: "/segments", icon: BookOpen },
    { name: "Revision Hub", href: "/revision", icon: HelpCircle },
    { name: "Solved Problems", href: "/problems", icon: Award },
    { name: "Learning Paths", href: "/paths", icon: GitFork },
    { name: "CF Sync", href: "/sync", icon: RefreshCw },
  ];

  const [searchHandle, setSearchHandle] = useState("");
  const [activeUser, setActiveUser] = useState<{ handle: string; rating: number; rank: string } | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.handle && data.handle !== "Not Connected") {
          setActiveUser(data);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchHandle.trim();
    if (!clean) return;
    router.push(`/sync?handle=${encodeURIComponent(clean)}&auto=1`);
    setSearchHandle("");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 flex items-center gap-1.5">
                CP Brain <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Knowledge System</span>
              </span>
              <span className="text-xs text-zinc-500 block">Personal Codeforces Synapse</span>
            </div>
          </Link>
        </div>

        {/* Primary Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-900 text-white font-semibold shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-zinc-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Direct Handle Search & Active User */}
        <div className="flex items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchHandle}
              onChange={(e) => setSearchHandle(e.target.value)}
              placeholder="Search CF handle..."
              className="w-36 sm:w-48 lg:w-56 rounded-full border border-zinc-200 bg-zinc-50/90 pl-8 pr-3 py-1.5 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
            />
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          </form>

          <Link
            href="/sync"
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors shadow-2xs shrink-0"
            title="Open Sync or Change Handle"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-zinc-900">{activeUser ? activeUser.handle : "CF Sync"}</span>
            {activeUser && (
              <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-800">
                {activeUser.rating}
              </span>
            )}
          </Link>

          <a
            href="https://codeforces.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-600 transition-colors"
          >
            Codeforces <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden border-t border-zinc-100 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-medium ${
                isActive ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
