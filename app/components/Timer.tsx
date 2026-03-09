"use client";

import { useEffect, useState } from "react";
import { HiOutlineClock } from "react-icons/hi2";

interface TimerProps {
    expiryDate: Date | string;
}

export default function Timer({ expiryDate }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(expiryDate).getTime() - new Date().getTime();

            if (difference <= 0) {
                setTimeLeft("Expired");
                setIsExpired(true);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);

            let timeString = "";
            if (days > 0) timeString += `${days}d `;
            if (hours > 0 || days > 0) timeString += `${hours}h `;
            timeString += `${minutes}m`;

            setTimeLeft(timeString);
            setIsExpired(false);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [expiryDate]);

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm border transition-all duration-300 ${isExpired
            ? "bg-red-50 text-red-600 border-red-100/50"
            : "bg-purple-50 text-purple-600 border-purple-100/50 hover:bg-purple-100/50"
            }`}>
            <HiOutlineClock className={`text-sm ${isExpired ? "animate-pulse" : ""}`} />
            <span>{!isExpired && "Expires in: "}{timeLeft}</span>
        </div>
    );
}