"use client";

import Jobs from "../components/Jobs";
import Navbar from "../components/Navbar";
import Resumes from "../components/Resumes";
import Analysis from "../components/Analysis";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <Navbar userName="John Doe" />
      <div className="flex gap-4 mt-6">
        <div className="w-3/5">
          <Analysis />
        </div>
        <div className="flex flex-col gap-4 w-2/5">
          <Jobs />
          <Resumes />
        </div>
      </div>
    </div>
  );
}
