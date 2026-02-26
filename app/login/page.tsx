"use client";

export default function Login() {
    return (
        <div>
            <h1 className="text-2xl font-bold">Login</h1>
            <form>
                <input type="text" placeholder="Username" className="border border-gray-300 rounded-md p-2" />
                <input type="password" placeholder="Password" className="border border-gray-300 rounded-md p-2" />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}
