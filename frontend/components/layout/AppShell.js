"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { clearAuthData, getAuthData } from "@/lib/auth";
import { getDashboardPath } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

export default function AppShell({ title, description, children, user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const savedAuth = mounted ? getAuthData() : null;
  const currentUser = user || savedAuth?.user || null;
  const dashboardHref = getDashboardPath(currentUser?.role);

  const menuItems = [
    {
      label: "Dashboard",
      href: dashboardHref,
      roles: ["Staff", "Secretariat", "Case Manager", "Admin"]
    },
    {
      label: "Submit Complaint",
      href: "/submit-complaint",
      roles: ["Staff"]
    },
    {
      label: currentUser?.role === "Staff" ? "My Complaints" : "Inbox",
      href: "/cases",
      roles: ["Staff", "Secretariat", "Case Manager"]
    },
    {
      label: "Polls",
      href: "/polls",
      roles: ["Staff", "Secretariat", "Case Manager"]
    },
    {
      label: "Public Hub",
      href: "/public-hub",
      roles: ["Staff", "Secretariat", "Case Manager"]
    },
    {
      label: "Analytics",
      href: "/analytics",
      roles: ["Secretariat", "Admin"]
    }
  ];

  function handleLogout() {
    clearAuthData();
    router.push("/login");
  }

  const visibleItems = menuItems.filter((item) => {
    if (item.public) return true;
    if (!currentUser) return false;
    return item.roles.includes(currentUser.role);
  });

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen shrink-0">
        <div className="p-6">
          <Link href={dashboardHref} className="text-xl font-bold tracking-tight text-slate-900">
            NeoConnect
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = item.label === "Dashboard" 
              ? pathname.startsWith("/dashboard") 
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-slate-100 text-slate-900" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          {currentUser ? (
            <div className="space-y-4">
              <div className="px-2">
                <p className="text-sm font-medium text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
              </div>
              <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/login" className="block">
              <Button className="w-full">Login</Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (visible only on small screens) */}
        <header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-6 h-16">
          <Link href={dashboardHref} className="text-lg font-bold tracking-tight text-slate-900">
            NeoConnect
          </Link>
          {currentUser ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          ) : (
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
            {(title || description) && (
              <div className="mb-8 pl-1">
                {title && <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>}
                {description && <p className="mt-2 text-base text-slate-500 max-w-2xl">{description}</p>}
              </div>
            )}
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
