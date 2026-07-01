"use client";

import LoadingSpinner from "@/components/loading";
import { logAdmin } from "@/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const [loginForm, setLoginForm] = useState<Record<string, string>>({
    username: "",
    password: "",
  });
  const [loginErr, setLoginErr] = useState<string>();
  const navigate = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!loginForm.username || !loginForm.password) {
      setLoginErr("Username or Password Incorrect");
      return;
    }
    setLoading(true);
    logAdmin(loginForm.username, loginForm.password).then((res) => {
      if (res.success) {
        return navigate.replace("/admin");
      }
      setLoading(false);
      setLoginErr(res.message);
    });
  };
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div
        className="w-full max-w-md"
        style={{ animation: "scaleUp 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-lime-800 shadow-xl shadow-lime-200 flex items-center justify-center text-2xl mx-auto mb-4">
            🔐
          </div>
          <h1
            className="font-extrabold text-slate-800 text-3xl"
            style={{ fontFamily: "'Playfair Display',serif" }}
          >
            Admin Login
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Authorized personnel only
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          {[
            { k: "username", label: "Username", type: "text", ph: "admin" },
            {
              k: "password",
              label: "Password",
              type: "password",
              ph: "••••••••",
            },
          ].map((f) => (
            <div key={f.k} className="mb-4">
              <label className="block text-xs font-bold text-lime-800 uppercase tracking-widest mb-1.5">
                {f.label}
              </label>
              <input
                type={f.type}
                placeholder={f.ph}
                value={loginForm[f.k]}
                onChange={(e) =>
                  setLoginForm((p) => ({ ...p, [f.k]: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-lime-400 text-slate-800"
              />
            </div>
          ))}
          {loginErr && (
            <p className="text-red-500 text-sm mb-4">⚠ {loginErr}</p>
          )}
          <button
            disabled={loading}
            onClick={handleLogin}
            className="w-full bg-lime-800 hover:bg-lime-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-lime-200 mt-2 text-sm"
          >
            {loading ? <LoadingSpinner /> : "Sign In"}
          </button>
        </div>
      </div>
    </main>
  );
}
