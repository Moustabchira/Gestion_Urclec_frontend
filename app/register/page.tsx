import RegisterForm from "@/components/auth/registerForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  )
}
