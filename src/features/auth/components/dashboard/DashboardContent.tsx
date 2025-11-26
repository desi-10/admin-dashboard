"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MdOutlineAdminPanelSettings, MdLogout, MdDashboard } from "react-icons/md";
import type { User } from "@/features/auth/types/auth.types";

interface DashboardContentProps {
  user: User;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/features/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      } else {
        console.error("Logout failed");
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <header className="flex items-center justify-between mb-8 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MdOutlineAdminPanelSettings size={32} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back, {user.username}!
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="gap-2"
        >
          <MdLogout size={18} />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </header>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdDashboard size={24} />
              Dashboard Overview
            </CardTitle>
            <CardDescription>
              You are successfully logged in and authenticated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">User ID:</span> {user.id}
              </p>
              <p>
                <span className="font-semibold">Username:</span> {user.username}
              </p>
              <p className="pt-4 text-gray-600 dark:text-gray-400">
                This is a protected page that requires authentication. The
                middleware automatically redirects unauthenticated users to the
                login page.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Database Management</CardTitle>
              <CardDescription>Connect and manage your databases</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Coming soon: Dynamic database connection and CRUD operations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Management</CardTitle>
              <CardDescription>Manage users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Coming soon: User administration features.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>Configure your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Coming soon: Dashboard configuration options.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-lg">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>This authentication system is ready to be extended with:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Database-backed user authentication</li>
              <li>Password hashing and security improvements</li>
              <li>Role-based access control</li>
              <li>Additional dashboard features</li>
              <li>User profile management</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
