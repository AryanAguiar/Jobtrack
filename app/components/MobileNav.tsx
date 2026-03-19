"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineChartBar,
} from "react-icons/hi";

const navItems = [
  { name: "Home", href: "/dashboard", icon: HiOutlineHome },
  { name: "Jobs", href: "/jobs", icon: HiOutlineBriefcase },
  { name: "Statistic", href: "/evaluations", icon: HiOutlineChartBar },
  { name: "Resumes", href: "/resumes", icon: HiOutlineDocumentText },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a24]/95 backdrop-blur-xl border-t border-[#2a2a3a] lg:hidden pb-safe">
      <div className="flex items-center justify-around h-[84px] px-2">
        {navItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) && item.href !== "/dashboard");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full gap-1.5 pt-2 pb-4 relative group"
            >
              <div
                className={`flex items-center justify-center p-2.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "text-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.15)]"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Icon
                  className={`text-[26px] transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-bold tracking-wide transition-colors ${
                  isActive ? "text-orange-500" : "text-gray-600"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
