"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, ArrowUpRight } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const section = pathname.includes("/products") ? "Catalogue" : pathname.includes("/clients") ? "Clients" : pathname.includes("/gallery") ? "Galerie" : "Vue d’ensemble";
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="admin-header">
        <SidebarTrigger className="md:hidden" aria-label="Ouvrir la navigation" />
        <div className="admin-header-title">Espace de gestion <span aria-hidden="true"> / </span> <strong>{section}</strong></div>
        <div className="admin-header-right">
          {process.env.NEXT_PUBLIC_ADMIN_REFONTE === "1" && <Link className="admin-store-link" href={process.env.NEXT_PUBLIC_STOREFRONT_URL || "https://yodi-k.com"} target="_blank" rel="noopener noreferrer" aria-label="Voir la boutique (nouvel onglet)">Voir la boutique <ArrowUpRight size={15}/></Link>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                aria-label="Menu du compte administrateur" className="admin-avatar relative h-9 w-9 rounded-full cursor-pointer"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/default-user.png"
                    alt={session?.user?.firstname}
                  />
                  <AvatarFallback>
                    {session?.user?.firstname?.[0]}
                    {session?.user?.lastname?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.firstname} {session?.user?.lastname}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
    </header>
  );
}
