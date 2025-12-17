"use client"

import LoginForm from "@/components/auth/loginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
