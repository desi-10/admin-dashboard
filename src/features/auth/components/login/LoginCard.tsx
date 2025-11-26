"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./LoginForm";
import { MdOutlineAdminPanelSettings } from "react-icons/md";

export function LoginCard() {
  const [successMessage, setSuccessMessage] = useState("");

  const handleSuccess = (user: { id: string; username: string }) => {
    setSuccessMessage(`Welcome back, ${user.username}!`);
  };

  const handleError = (message: string) => {
    console.error("Login error:", message);
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <MdOutlineAdminPanelSettings size={40} className="text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
          <CardDescription className="text-base">
            Sign in to access your dashboard
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {successMessage && (
          <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            {successMessage}
          </div>
        )}

        <LoginForm onSuccess={handleSuccess} onError={handleError} />
      </CardContent>
    </Card>
  );
}
