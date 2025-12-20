import { cva, VariantProps } from "class-variance-authority";
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
import { LayoutDashboardIcon, LogOutIcon, SettingsIcon } from "lucide-react";

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
  imageUrl: string | null | undefined;
  name: string;
  className?: string;
  onClickLogout?: () => void;
}

export const UserAvatarPersonal = ({
  imageUrl,
  name,
  size,
  className,
  onClickLogout,
}: UserAvatarProps) => {
  // todos: add a shorcut later
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Avatar className={cn(avatarVariants({ size, className }))}>
          <AvatarImage src={imageUrl as string} alt={name} />
          <AvatarFallback className="bg-green-800 text-2xl text-white">
            {name[0]}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-75 md:w-80 lg:w-100" align="end">
        <DropdownMenuLabel className="text-xl">My account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <SettingsIcon />
            Manage account <DropdownMenuShortcut>⇧⌘M</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LayoutDashboardIcon />
            Dashboard<DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onClickLogout}>
            <LogOutIcon />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
