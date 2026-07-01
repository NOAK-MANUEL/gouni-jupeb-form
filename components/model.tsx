"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function ModalOverlay({
  children,
  close,
  setClose,
}: Readonly<{
  children: React.ReactNode;
  close?: boolean;
  setClose: Dispatch<SetStateAction<boolean>>;
}>) {
  // const [close, setClose] = useState(false);
  const onClose = () => {
    setClose(!close);
    console.log("yes");
  };
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 max-h-[90vh] overflow-y-auto"
        style={{ animation: "scaleUp 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition text-sm"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
