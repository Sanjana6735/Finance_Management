
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";
import NotificationsButton from "./NotificationsButton";

const NavbarUserMenu = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="outline">Login</Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <NotificationsButton />
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url || ""} alt="User" />
              <AvatarFallback>
                {user.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.user_metadata?.username || user.email?.split('@')[0] || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link to="/dashboard" onClick={() => setIsOpen(false)}>
            <DropdownMenuItem>Dashboard</DropdownMenuItem>
          </Link>
          <Link to="/profile" onClick={() => setIsOpen(false)}>
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </Link>
          <Link to="/settings" onClick={() => setIsOpen(false)}>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NavbarUserMenu;
