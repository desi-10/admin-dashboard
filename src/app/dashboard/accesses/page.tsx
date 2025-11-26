"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MdOutlinePeople } from "react-icons/md";

export default function AccessesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage accesses</h1>
        <p className="text-muted-foreground">
          Control who has access to your admin panel
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdOutlinePeople size={24} />
            User Management
          </CardTitle>
          <CardDescription>
            Add or remove users who can access this dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>User management coming soon...</p>
          <p className="text-sm mt-2">
            You will be able to invite team members and manage their permissions here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

