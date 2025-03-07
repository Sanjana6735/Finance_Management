
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    fullName: "",
    email: "",
    avatarUrl: ""
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        console.log("Fetching profile for user ID:", userId);
        
        // Get user metadata from auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        console.log("Auth user data:", authUser);
        
        // First try to get from profiles table
        let { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .limit(1);
        
        if (error) {
          console.error("Error fetching profile:", error);
          // Create the profiles table if it doesn't exist
          try {
            await supabase
              .from('profiles')
              .upsert({
                id: userId,
                username: authUser?.user_metadata?.username || authUser?.email?.split('@')[0] || "",
                full_name: authUser?.user_metadata?.full_name || "",
                avatar_url: authUser?.user_metadata?.avatar_url || "",
                updated_at: new Date().toISOString()
              });
              
            // Fetch the profile again
            const { data: retryProfiles, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .limit(1);
              
            if (retryError) {
              console.error("Error fetching profile after creation:", retryError);
              profiles = null;
            } else {
              profiles = retryProfiles;
              console.log("Profile created and fetched:", profiles);
            }
          } catch (err) {
            console.error("Error creating profile:", err);
            profiles = null;
          }
        }

        // Set data from profile or user auth data
        setUserData({
          username: profiles?.[0]?.username || authUser?.user_metadata?.username || authUser?.email?.split('@')[0] || "",
          fullName: profiles?.[0]?.full_name || authUser?.user_metadata?.full_name || "",
          email: authUser?.email || "",
          avatarUrl: profiles?.[0]?.avatar_url || authUser?.user_metadata?.avatar_url || ""
        });
        
        console.log("User data set:", userData);
      } catch (err) {
        console.error("Error fetching user data:", err);
        toast({
          title: "Error",
          description: "Failed to load user profile data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, user, toast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    try {
      console.log("Updating profile for user ID:", userId);
      console.log("Profile data to update:", userData);
      
      // First update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          username: userData.username,
          full_name: userData.fullName,
          avatar_url: userData.avatarUrl
        }
      });
      
      if (updateError) {
        console.error("Error updating user metadata:", updateError);
        throw updateError;
      }
      
      // Then update profiles table
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username: userData.username,
          full_name: userData.fullName,
          avatar_url: userData.avatarUrl,
          updated_at: new Date().toISOString()
        });

      if (upsertError) {
        console.error("Error upserting profile:", upsertError);
        throw upsertError;
      }

      console.log("Profile updated successfully");
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle file upload for avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!userId) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar-${userId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      setSaving(true);
      console.log("Uploading avatar for user ID:", userId);

      // Check if storage bucket exists, create if not
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarBucket = buckets?.find(b => b.name === 'avatars');
      
      if (!avatarBucket) {
        console.log("Creating avatars bucket");
        await supabase.storage.createBucket('avatars', {
          public: true
        });
      }

      // Upload file
      console.log("Uploading file to path:", filePath);
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update avatar URL in state and database
      const avatarUrl = urlData?.publicUrl;
      console.log("Avatar uploaded, public URL:", avatarUrl);
      
      setUserData({ ...userData, avatarUrl });

      // First update user metadata
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });
      
      if (authUpdateError) {
        console.error("Error updating auth user with avatar:", authUpdateError);
        throw authUpdateError;
      }
      
      // Then update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error("Error updating profile with avatar:", updateError);
        throw updateError;
      }

      console.log("Avatar updated successfully");
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (err) {
      console.error("Error uploading avatar:", err);
      toast({
        title: "Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 py-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1 mb-6">
          View and manage your personal information
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Your Avatar</CardTitle>
                <CardDescription>
                  This will be displayed on your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={userData.avatarUrl} />
                  <AvatarFallback className="text-2xl">
                    {userData.username?.[0]?.toUpperCase() || userData.fullName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="w-full">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Change Avatar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Manage your personal details and account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={userData.username}
                      onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                      placeholder="Your username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={userData.fullName}
                      onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={userData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Please contact support if you need to update your email.
                    </p>
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
