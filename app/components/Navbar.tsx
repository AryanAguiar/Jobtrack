import { FC, useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { IoMdExit } from "react-icons/io";

interface NavbarProps {
    userName: string;
}

const Navbar: FC<NavbarProps> = ({ userName }) => {
    const [open, setOpen] = useState(false);

    async function handleLogout() {
        await fetch("/api/auth/login", {
            method: "DELETE",
        });
        localStorage.setItem("logout-event", Date.now().toString());
        window.location.href = "/login";
        setOpen(false);
    }


    return (
        <nav className="flex items-center justify-between py-2 mt-7 text-black">

            <div className="flex-1">
                <span className="font-bold text-sm sm:text-base">Welcome, {userName}</span>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Your overview</p>
            </div>

            <div className="flex gap-4 items-center">
                <button onClick={() => setOpen(!open)} className="text-gray-500 text-4xl cursor-pointer hover:text-black transition-colors"><IoMdExit /></button>
            </div>
            {open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Sign Out</h3>
                            <p className="text-gray-500 mt-2">Are you sure you want to log out of your account?</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleLogout}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-red-200"
                            >
                                Log Out
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
