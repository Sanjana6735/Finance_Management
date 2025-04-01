
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  username?: string;
  avatar_url?: string;
}

const NavbarUserMenu = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        // Try to get profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (!profileError) {
          setProfile(profileData);
        } else if (profileError.code !== 'PGRST116') {
          console.error("Error fetching profile:", profileError);
        }
        
        // If no profile found, use metadata from auth
        if (!profileData || (!profileData.username && !profileData.avatar_url)) {
          setProfile({
            username: user.user_metadata?.username || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchProfile();
  }, [user]);

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

  // Display name for user
  const displayName = profile?.username || user.user_metadata?.username || user.email?.split('@')[0] || "User";
  
  // Avatar image or fallback
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || "";
  const avatarFallback = displayName[0].toUpperCase() || "U";

  return (
    <div className="flex items-center gap-2">
      <NotificationsButton />
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} alt="User" />
              <AvatarFallback>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {displayName}
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
