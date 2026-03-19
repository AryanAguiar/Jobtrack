"use client";

import Jobs from "../components/Jobs";
import Resumes from "../components/Resumes";
import Analysis from "../components/Analysis";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

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

    fetchUser();
  }, []);

  return (
    <div className="max-w-7xl w-full mx-auto lg:px-6 lg:py-6 min-h-full lg:h-full flex flex-col pt-4 lg:pt-0">
      <div className="flex flex-col lg:flex-row gap-2 lg:gap-6 lg:mt-6 flex-1 min-h-0">
        <div className="w-full lg:w-[62%] lg:h-[calc(100vh-60px)] lg:min-h-[640px]">
          <Analysis id={user?.id} />
        </div>
        <div className="flex flex-col gap-2 lg:gap-6 w-full lg:w-[38%] lg:h-[calc(100vh-60px)]">
          <div className="w-full lg:flex-1 lg:min-h-[240px]">
            <Jobs id={user?.id} />
          </div>
          <div className="w-full lg:flex-1 lg:min-h-[240px]">
            <Resumes id={user?.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
