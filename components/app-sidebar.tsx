"use client";

import * as React from "react";
import {
  CheckSquare,
  Dot,
  FolderKanban,
  Home,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@/interfaces/project.interface";
import { Separator } from "@radix-ui/react-separator";
import { colorMap } from "@/utils/color-map.util";

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderKanban,
  },
];



export function AppSidebar() {
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    }
  });
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-lg font-semibold">TaskFlow</span>
        </div>
        <hr></hr>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>MENU</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroupLabel>PROJECTS</SidebarGroupLabel>
              <SidebarMenu>
                          <SidebarGroupContent>
              {projects.map((project) => (
                 <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild >
                    <Link href={`/projects/${project.id}`}>
                      <span><Dot className={`size-8 ${colorMap[project.color]}`}/></span>
                      <span>{project.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarGroupContent>
              </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
