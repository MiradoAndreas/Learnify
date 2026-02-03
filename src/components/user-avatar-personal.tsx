"use client";
import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  GraduationCapIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { Separator } from "./ui/separator";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

const avatarVariants = cva("", {
  variants: {
    size: {
      default: "h-9 w-9",
      xs: "h-4 w-4",
      sm: "h-6 w-6",
      lg: "h-10 w-10",
      xl: "h-[160px] w-[160px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl?: string | null;
  name: string;
  email: string;
  className?: string;
  onClickLogout?: () => void;
  userId?: string; // Ajout d'une prop pour l'ID utilisateur
}

export const UserAvatarPersonal = ({
  imageUrl,
  name,
  size,
  email,
  className,
  onClickLogout,
  userId,
}: UserAvatarProps) => {

  const [open, setOpen] = useState(false);
  

  // Générer les initiales pour l'avatar fallback
  const getInitials = () => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-block"
      >
        <DropdownMenuTrigger asChild>
          <button className="outline-none">
            <Avatar className={cn(avatarVariants({ size, className }))}>
              <AvatarImage 
                src={imageUrl || undefined} 
                alt={`Avatar de ${name}`} 
              />
              <AvatarFallback className="bg-[#00887a] font-light text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[250px] md:w-[300px] lg:w-[320px]"
          align="end"
          sideOffset={8}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <DropdownMenuLabel className="px-4 py-3">
            <div className="flex gap-3">
              <Avatar className={cn(avatarVariants({ size: "default" }))}>
                <AvatarImage src={imageUrl || undefined} alt={name} />
                <AvatarFallback className="bg-[#00887a] text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {name}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <Separator className="my-1" />
          
          <DropdownMenuGroup>
            <DropdownMenuItem 
              className="flex items-center gap-3 px-4 py-3 cursor-pointer"
             
            >
              <UserIcon className="h-4 w-4" />
              <span className="text-sm">Mon profil</span>
              <DropdownMenuShortcut>⇧⌘U</DropdownMenuShortcut>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="cursor-pointer"
              
            >
              <Link href={`/home/manage-account`} className="flex items-center gap-3  py-3 cursor-pointer">
              <SettingsIcon className="h-4 w-4" />
              <span className="text-sm">Gérer le compte</span>
              <DropdownMenuShortcut>⇧⌘M</DropdownMenuShortcut></Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 cursor-pointer">
              <GraduationCapIcon className="h-4 w-4" />
              <span className="text-sm">Professeur</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="flex items-center gap-3 px-4 py-3 cursor-pointer text-red-600 focus:text-red-600"
              onClick={onClickLogout}
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="text-sm">Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <div className="bg-[#f7f0eb] px-4 py-3 -mx-1 -mb-1">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">Sécurisé par</p>
                <div className="flex items-center gap-1">
                  <Image
                    src="/logos/logo-miranga.png"
                    width={20}
                    height={20}
                    alt="Logo Miranga"
                    className="object-contain"
                  />
                  <span className="text-sm font-bold text-foreground">
                    Learnify
                  </span>
                </div>
              </div>
              <p className="text-xs font-semibold text-[#f36b16]">
                © 2025 Learnify by Miranga
              </p>
            </div>
          </div>
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
};