"use client";

import { FC, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    HiOutlineHome,
    HiOutlineBriefcase,
    HiOutlineDocumentText,
    HiOutlineChartBar,
    HiOutlineCog,
    HiX
} from "react-icons/hi";
import { IoMdExit } from "react-icons/io";
import { showCustomToast } from "./CustomToast";

interface SidebarProps {
    userName: string;
    isOpen: boolean;
    onClose: () => void;
}

const menuItems = [
    { name: "Dashboard", icon: HiOutlineHome, href: "/dashboard" },
    { name: "Jobs", icon: HiOutlineBriefcase, href: "/jobs" },
    { name: "Resumes", icon: HiOutlineDocumentText, href: "/resumes" },
    { name: "Evaluations", icon: HiOutlineChartBar, href: "/evaluations" },
];

const Sidebar: FC<SidebarProps> = ({ userName, isOpen, onClose }) => {
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });

    useEffect(() => {
        const updateIndicator = () => {
            const activeIndex = menuItems.findIndex(item => pathname === item.href);
            if (activeIndex !== -1 && navRef.current) {
                // The indicator overlay is the first child (index 0), links start at index 1
                const activeElement = navRef.current.children[activeIndex + 1] as HTMLElement;
                if (activeElement) {
                    setIndicatorStyle({
                        top: activeElement.offsetTop,
                        height: activeElement.offsetHeight,
                        opacity: 1
                    });
                }
            } else {
                setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
            }
        };

        // Delay the first update slightly to ensure layout is fully computed
        updateIndicator();
        setTimeout(updateIndicator, 50); 
        
        window.addEventListener("resize", updateIndicator);
        return () => window.removeEventListener("resize", updateIndicator);
    }, [pathname]);

    async function handleLogout() {
        await fetch("/api/auth/login", {
            method: "DELETE",
        });
        localStorage.setItem("logout-event", Date.now().toString());
        window.location.href = "/login";
    }

    return (
        <aside className={`
            fixed inset-y-0 left-0 z-50 w-full md:w-80 bg-[#1a1a24] lg:bg-[#1a1a24]/80 backdrop-blur-2xl border-r border-[#2a2a3a] p-6 
            flex flex-col shadow-[8px_0_32px_-12px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            lg:relative lg:w-72 lg:flex lg:h-screen
        `}>
            {/* Mobile Close Button */}
            <button
                onClick={onClose}
                className="lg:hidden absolute top-6 right-6 p-2 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
                <HiX className="text-2xl" />
            </button>

            <div className="mb-12 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-gradient rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <span className="text-white font-black text-xl">J</span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tighter">Jobtrack</h1>
                </div>
                <div className="mt-6">
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Welcome,</span>
                        <span className="text-lg font-black text-orange-400 truncate">{userName}</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-2 relative" ref={navRef}>
                {/* Sliding indicator */}
                <div 
                    className="absolute left-0 right-0 bg-orange-500/10 border border-orange-500/20 shadow-lg shadow-orange-500/5 rounded-2xl transition-all duration-300 ease-in-out pointer-events-none z-0"
                    style={{
                        top: `${indicatorStyle.top}px`,
                        height: `${indicatorStyle.height}px`,
                        opacity: indicatorStyle.opacity,
                    }}
                />

                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                                if (window.innerWidth < 1024) onClose();
                            }}
                            className={`relative z-10 flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors duration-300 group ${isActive
                                ? "text-orange-400"
                                : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                                }`}
                        >
                            <Icon className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-orange-500" : ""}`} />
                            <span className="font-bold tracking-tight">{item.name}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 space-y-2 border-t border-[#2a2a3a]/50">
                <button
                    onClick={() => {
                        showCustomToast.confirm(
                            "Confirm Logout",
                            "Are you sure you want to log out of your account?",
                            handleLogout,
                            "Yes, Logout"
                        );
                    }}
                    className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group cursor-pointer"
                >
                    <IoMdExit className="text-2xl transition-transform duration-300 group-hover:scale-110" />
                    <span className="font-bold tracking-tight">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
