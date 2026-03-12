"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSync() {
    const router = useRouter();

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === "logout-event") {
                router.push("/login");
                router.refresh();
            }
        };

        window.addEventListener("storage", handleStorageChange);

        localStorage.removeItem("logout-event");

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [router]);

    return null;
}
