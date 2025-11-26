import { LoginCard } from "@/features/auth/components/login/LoginCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Admin Dashboard",
  description: "Sign in to access your admin dashboard",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <LoginCard />
    </div>
  );
}
