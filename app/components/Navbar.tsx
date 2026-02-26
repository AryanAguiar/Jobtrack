import React, { FC } from "react";
import { FaGear } from "react-icons/fa6";
import { HiMagnifyingGlass } from "react-icons/hi2";

interface NavbarProps {
    userName: string;
}

const Navbar: FC<NavbarProps> = ({ userName }) => {
    return (
        <nav className="flex items-center justify-between py-2 mt-7 text-black">

            <div className="flex-1">
                <span className="font-bold">Welcome, {userName}</span>
                <p className="text-gray-400 text-sm font-medium">Your overview</p>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative w-64">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full pl-11 pr-4 py-2 bg-black/5 hover:bg-black/10 rounded-full border-none focus:outline-none focus:bg-black/10 transition-colors text-black placeholder-gray-500"
                    />
                </div>
                <button className="text-gray-500 text-xl cursor-pointer hover:text-black transition-colors"><FaGear /></button>
            </div>
        </nav>
    );
};

export default Navbar;
