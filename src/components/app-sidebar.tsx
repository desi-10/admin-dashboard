"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDatabase } from "@/features/database/context/DatabaseContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MdOutlineTableChart,
  MdOutlineRefresh,
  MdOutlineFlag,
  MdOutlinePeople,
  MdOutlineHelp,
} from "react-icons/md";
import { FiDatabase, FiLoader } from "react-icons/fi";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { dbUrl, tables, isLoading, error, refreshTables } = useDatabase();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <FiDatabase size={18} className="text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">Admin Panel</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/get-started"}
                >
                  <Link href="/dashboard/get-started">
                    <MdOutlineFlag size={18} />
                    <span>Getting started</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/accesses"}
                >
                  <Link href="/dashboard/accesses">
                    <MdOutlinePeople size={18} />
                    <span>Manage accesses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tables Section */}
        {dbUrl && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              <span>Tables</span>
              <div className="flex items-center gap-1">
                {isLoading && <FiLoader size={14} className="animate-spin" />}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={refreshTables}
                  disabled={isLoading}
                >
                  <MdOutlineRefresh
                    size={14}
                    className={isLoading ? "animate-spin" : ""}
                  />
                </Button>
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {error && (
                  <div className="px-2 py-1 text-xs text-red-500">{error}</div>
                )}

                {!isLoading && tables.length === 0 && !error && (
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    No tables found
                  </div>
                )}

                {tables.map((table) => (
                  <SidebarMenuItem key={table.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/dashboard/tables/${table.name}`}
                    >
                      <Link href={`/dashboard/tables/${table.name}`}>
                        <MdOutlineTableChart size={18} />
                        <span className="truncate">{table.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {table.columns.length}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">Admin</span>
          <Button variant="ghost" size="sm" className="ml-auto h-8 w-8 p-0">
            <MdOutlineHelp size={18} />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
