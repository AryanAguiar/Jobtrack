"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { Toaster } from "sonner";
import AuthSync from "./AuthSync";
import { useEffect, useState } from "react";
import { HiMenuAlt2 } from "react-icons/hi";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/";
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    if (!isAuthPage) {
      fetchUser();
    }
  }, [isAuthPage]);

  if (isAuthPage) {
    return (
      <>
        <AuthSync />
        {children}
        <Toaster
          position="top-center"
          expand={false}
          visibleToasts={1}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f0f14] overflow-hidden text-white font-sans relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xl z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        userName={user?.name || "Loading..."}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Header */}
        {!isAuthPage && (
          <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#1a1a24]/80 backdrop-blur-xl border-b border-[#2a2a3a] z-30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-gradient rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-white font-black text-sm">J</span>
              </div>
              <h1 className="text-xl font-black text-white tracking-tighter">Jobtrack</h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              <HiMenuAlt2 className="text-2xl" />
            </button>
          </header>
        )}

        <main className="flex-1 relative h-full overflow-y-auto custom-scrollbar">
          {children}
          <Toaster
            position="top-center"
            expand={false}
            visibleToasts={1}
          />
        </main>
      </div>
      <AuthSync />
    </div>
  );
}
