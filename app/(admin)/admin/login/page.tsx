"use client";
import React, { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import CustomButton from "@/app/components/client/common/CustomButton";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = "/admin";
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("An error occurred during login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-cream-background rounded-[10px] shadow-md p-10 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-10">
          <Image
            src="/assets/logos/header-logo.svg"
            alt="Logo"
            width={200}
            height={100}
          />
          <p className="text-subtitle-2 font-semibold text-primary uppercase">
            Admin Login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            required
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 border border-secondary rounded-[10px] text-sm focus:outline-none focus:border-primary transition-colors duration-500 ease-in-out"
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 pr-11 border border-secondary rounded-[10px] text-sm focus:outline-none focus:border-primary transition-colors duration-500 ease-in-out"
            />
            <button
              type="button"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              onTouchStart={() => setShowPassword(true)}
              onTouchEnd={() => setShowPassword(false)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-description-color hover:text-primary transition-colors duration-300"
            >
              {showPassword ? (
                <EyeOff className="w-4.5 h-4.5" />
              ) : (
                <Eye className="w-4.5 h-4.5" />
              )}
            </button>
          </div>

          <CustomButton text="Submit" type="submit" variant="3" btnClass="w-fit mx-auto" />
        </form>
      </div>
    </div>
  );
}