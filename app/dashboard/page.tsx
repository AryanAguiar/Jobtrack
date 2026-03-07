"use client";

import Jobs from "../components/Jobs";
import Navbar from "../components/Navbar";
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Navbar userName={user?.name || "Loading..."} />
      <div className="flex flex-col lg:flex-row gap-4 mt-6">
        <div className="w-full lg:w-3/5">
          <Analysis id={user?.id} />
        </div>
        <div className="flex flex-col gap-4 w-full lg:w-2/5">
          <Jobs id={user?.id} />
          <Resumes id={user?.id} />
        </div>
      </div>
    </div>
  );
}
