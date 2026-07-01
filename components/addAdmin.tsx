"use client";
import LoadingSpinner from "@/components/loading";
import ModalOverlay from "@/components/model";
import { createAdmin } from "@/actions";
import { Dispatch, SetStateAction, useState } from "react";

export default function AddAdmin({
  close,
  setClose,
}: {
  close: boolean;
  setClose: Dispatch<SetStateAction<boolean>>;
}) {
  interface FormSchema {
    username: string;
    password: string;
    email: string;
  }
  const [loading, setLoading] = useState(false);
  const [addForm, setAddForm] = useState<FormSchema>({
    username: "",
    password: "",
    email: "",
  });
  const [addErr, setAddErr] = useState<string>();
  const handleAddAdmin = async () => {
    setLoading(true);
    const res = await createAdmin(
      addForm.username,
      addForm.email,
      addForm.password,
    );
    setLoading(false);
    if (!res.success) return setAddErr(res.message);
    setClose(!close);
  };
  return (
    <ModalOverlay close={close} setClose={setClose}>
      <div className="text-center mb-6">
        <div className="relative w-16 h-16 rounded-full bg-lime-100 flex items-center justify-center text-3xl mx-auto mb-3">
          👤
          <span
            className="absolute inset-0 rounded-full border-2 border-lime-400"
            style={{ animation: "pingRing 1.4s ease-out infinite" }}
          />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Add New Admin</h2>
        <p className="text-slate-400 text-sm mt-1">
          Grant administrative access to a new user
        </p>
      </div>
      {[
        {
          k: "username",
          label: "Username",
          type: "text",
          ph: "e.g. bursar_john",
        },
        { k: "email", label: "Email", type: "email", ph: "user@gouni.edu.ng" },
        { k: "password", label: "Password", type: "password", ph: "••••••••" },
      ].map((f) => (
        <div key={f.k} className="mb-4">
          <label className="block text-xs font-bold text-lime-800 uppercase tracking-widest mb-1.5">
            {f.label}
          </label>
          <input
            type={f.type}
            placeholder={f.ph}
            value={addForm[f.k as keyof FormSchema]}
            onChange={(e) =>
              setAddForm((p) => ({ ...p, [f.k]: e.target.value }))
            }
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-lime-400 text-slate-800 placeholder-slate-400"
          />
        </div>
      ))}
      {addErr && <p className="text-red-500 text-sm mb-3">⚠ {addErr}</p>}
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => {
            setClose(false);
            setAddErr("");
          }}
          className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          disabled={loading}
          onClick={handleAddAdmin}
          className="flex-1 py-3 rounded-xl bg-lime-800 hover:bg-lime-700 text-white text-sm font-bold transition shadow-lg shadow-blue-200"
        >
          {loading ? <LoadingSpinner /> : "Add Admin →"}
        </button>
      </div>
    </ModalOverlay>
  );
}
