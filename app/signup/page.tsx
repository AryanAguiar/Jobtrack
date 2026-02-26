"use client";

export default function Signup() {
    return (
        <div>
            <h1 className="text-2xl font-bold">Signup</h1>
            <form>
                <input type="text" placeholder="Username" className="border border-gray-300 rounded-md p-2" />
                <input type="password" placeholder="Password" className="border border-gray-300 rounded-md p-2" />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Signup</button>
            </form>
        </div>
    );
}