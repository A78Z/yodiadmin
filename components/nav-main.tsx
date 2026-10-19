"use client";

import { IconLayoutDashboard, type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Tableau de bord"
              className={`text-primary hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear ${
                pathname === "/dashboard" ? "bg-primary/90 text-primary-foreground" : ""
              }`}
              asChild
            >
              <Link href="/dashboard" aria-current={pathname === "/dashboard" ? "page" : undefined}>
                <IconLayoutDashboard />
                <span>Tableau de bord</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton className={`${(pathname === item.url || pathname.startsWith(`${item.url}/`)) ? "bg-primary/90 text-primary-foreground" : ""}`} tooltip={item.title} asChild>
                <Link href={item.url} aria-current={pathname === item.url || pathname.startsWith(`${item.url}/`) ? "page" : undefined}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
