"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { Toaster } from "sonner";
import AuthSync from "./AuthSync";
import { useEffect, useState } from "react";
import MobileNav from "./MobileNav";

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
        {/* Mobile Header */}
        {!isAuthPage && (
          <header className="lg:hidden flex items-center justify-between px-6 py-5 bg-[#0f0f14] z-30 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-orange-gradient rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 overflow-hidden text-white font-black text-xl border-2 border-[#1a1a24]">
                <span className="text-white font-black text-lg">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "J"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-gray-400">Hi there,</span>
                <span className="text-[17px] font-black text-gray-100 tracking-tight">{user?.name || "Loading..."}</span>
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 relative h-full overflow-y-auto custom-scrollbar">
          {children}
          {/* Spacer to prevent mobile nav from cutting off content */}
          {!isAuthPage && <div className="h-[100px] w-full lg:hidden shrink-0" />}
          <Toaster
            position="top-center"
            expand={false}
            visibleToasts={1}
          />
        </main>
      </div>
      {!isAuthPage && <MobileNav />}
      <AuthSync />
    </div>
  );
}
