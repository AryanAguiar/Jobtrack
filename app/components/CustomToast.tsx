"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HiCheck, HiExclamation, HiQuestionMarkCircle } from "react-icons/hi";

interface CustomToastProps {
    t: string | number;
    type: "success" | "error" | "confirm";
    title: string;
    description?: string;
    onAction?: () => void;
    actionLabel?: string;
    onCancel?: () => void;
}

export default function CustomToast({
    t,
    type,
    title,
    description,
    onAction,
    actionLabel = "Close",
    onCancel
}: CustomToastProps) {
    const [progress, setProgress] = useState(100);
    const duration = 5000;

    useEffect(() => {
        if (progress <= 0) {
            toast.dismiss(t);
        }
    }, [progress, t]);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => Math.max(0, prev - (100 / (duration / 100))));
        }, 100);

        return () => clearInterval(timer);
    }, []);

    // Calculate seconds remaining for the text timer
    const secondsLeft = Math.ceil((progress / 100) * (duration / 1000));
    const formattedTime = `00:0${secondsLeft}`.slice(-5);

    const getIcon = () => {
        switch (type) {
            case "success":
                return (
                    <div className="w-8 h-8 rounded-full border-2 border-orange-500 flex items-center justify-center">
                        <HiCheck className="text-xl text-orange-500" />
                    </div>
                );
            case "error":
                return (
                    <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center">
                        <HiExclamation className="text-xl text-red-500" />
                    </div>
                );
            case "confirm":
                return (
                    <div className="w-8 h-8 rounded-full border-2 border-orange-500 flex items-center justify-center">
                        <HiQuestionMarkCircle className="text-xl text-orange-500" />
                    </div>
                );
        }
    };

    const content = (
        <div className={`bg-gradient-to-b from-[#1a1a24] to-[#0f0f14] border border-[#2a2a3a] rounded-[24px] p-8 w-full max-w-[500px] shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col items-center text-center ${type === "confirm" ? "scale-105" : ""}`}>
            <div className="mb-5 relative flex justify-center">
                {getIcon()}
            </div>

            {/* whitespace-pre-line allows \n in the title to break to a new line just like the image */}
            <h3 className="text-[20px] font-medium text-white mb-3 tracking-wide leading-snug whitespace-pre-line">
                {title}
            </h3>

            {/* Subtitle / Timer */}
            {description && (
                <p className={`text-[#888888] text-[14px] font-medium ${type === "confirm" ? "mb-8" : "mb-2"}`}>
                    {description}
                </p>
            )}

            {type !== "confirm" && (
                <p className="text-[#888888] text-[14px] font-medium mb-8">
                    This window will close after {formattedTime}
                </p>
            )}

            <div className={`flex gap-3 justify-center w-full ${onCancel ? "flex-row" : "flex-col items-center"}`}>
                {onAction ? (
                    <button
                        onClick={() => {
                            onAction();
                            toast.dismiss(t);
                        }}
                        className="px-8 py-2.5 bg-orange-gradient hover:opacity-90 text-white font-semibold rounded-2xl transition-all cursor-pointer text-sm shadow-lg shadow-orange-500/20"
                    >
                        {actionLabel}
                    </button>
                ) : (
                    <button
                        onClick={() => toast.dismiss(t)}
                        className="px-8 py-2.5 bg-[#ffffff0a] border border-white/5 text-[#e5e5e5] font-medium rounded-2xl hover:bg-white/10 transition-all cursor-pointer text-sm"
                    >
                        {actionLabel}
                    </button>
                )}

                {onCancel && (
                    <button
                        onClick={() => {
                            if (onCancel) onCancel();
                            toast.dismiss(t);
                        }}
                        className="px-8 py-2.5 bg-transparent border border-white/10 text-gray-400 font-medium rounded-2xl hover:bg-white/5 hover:text-white transition-all cursor-pointer text-sm"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 flex items-start justify-center z-[9999] pointer-events-none pt-24">
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-xl animate-in fade-in duration-300 ${type === "confirm" ? "pointer-events-auto" : "pointer-events-auto"}`}
                style={{ WebkitBackdropFilter: "blur(24px)" }}
                onClick={() => toast.dismiss(t)}
            />
            <div className="relative z-10 pointer-events-auto">
                {content}
            </div>
        </div>
    );
}

export const showCustomToast = {
    success: (title: string, description?: string) => {
        toast.custom((t) => (
            <CustomToast t={t} type="success" title={title} description={description} />
        ), { duration: 5000, id: "jobtrack-toast" });
    },
    error: (title: string, description?: string) => {
        toast.custom((t) => (
            <CustomToast t={t} type="error" title={title} description={description} />
        ), { duration: 5000, id: "jobtrack-toast" });
    },
    confirm: (title: string, description: string, onAction: () => void, actionLabel: string = "Confirm", onCancel?: () => void) => {
        toast.custom((t) => (
            <CustomToast
                t={t}
                type="confirm"
                title={title}
                description={description}
                onAction={onAction}
                onCancel={onCancel || (() => { })}
                actionLabel={actionLabel}
            />
        ), { duration: 5000, id: "jobtrack-toast" });
    }
};