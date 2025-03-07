import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserProfile {
  displayName: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  updatedAt: Date;
}

interface ProfileFormData {
  displayName: string;
  username: string;
  email?: string;
  bio?: string;
  avatar?: FileList;
}

export function ProfilePage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    isValid: boolean;
    message: string;
    isChecking: boolean;
  }>({
    isValid: true,
    message: '',
    isChecking: false
  });

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors }, setValue, watch: watchProfile } = useForm<ProfileFormData>();

  // Watch username field for real-time validation
  const username = watchProfile('username');

  // Debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Check username availability
  const checkUsername = async (username: string) => {
    if (!username || username === userProfile?.username) {
      setUsernameStatus({
        isValid: true,
        message: '',
        isChecking: false
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setUsernameStatus({
        isValid: false,
        message: 'Username must be 3-20 characters and can only contain letters, numbers, and underscores',
        isChecking: false
      });
      return;
    }

    setUsernameStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      const usernamesRef = doc(db, 'usernames', username.toLowerCase());
      const usernameDoc = await getDoc(usernamesRef);
      
      if (usernameDoc.exists()) {
        const data = usernameDoc.data();
        const isAvailable = !data.uid || data.uid === user?.uid;
        
        setUsernameStatus({
          isValid: isAvailable,
          message: isAvailable ? 'Username is available' : 'Username is already taken',
          isChecking: false
        });
      } else {
        setUsernameStatus({
          isValid: true,
          message: 'Username is available',
          isChecking: false
        });
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameStatus({
        isValid: false,
        message: 'Error checking username availability',
        isChecking: false
      });
    }
  };

  // Debounced username check
  const debouncedCheckUsername = debounce(checkUsername, 500);

  // Watch username changes
  useEffect(() => {
    if (username) {
      debouncedCheckUsername(username);
    }
  }, [username]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data() as UserProfile;
          setUserProfile(profileData);
          
          // Set form values
          setValue('displayName', profileData.displayName);
          setValue('username', profileData.username);
          setValue('email', profileData.email);
          setValue('bio', profileData.bio || '');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user, toast, setValue]);

  const handleProfileUpdate = async (formData: ProfileFormData) => {
    if (!user || !userProfile) return;

    if (!formData.displayName || !formData.username) {
      toast({
        title: 'Error',
        description: 'Display name and username are required',
        variant: 'destructive',
      });
      return;
    }

    if (!usernameStatus.isValid) {
      toast({
        title: 'Error',
        description: usernameStatus.message,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let avatarUrl = userProfile.avatarUrl;

      // Handle avatar upload if a new file is selected
      if (formData.avatar?.length > 0) {
        const file = formData.avatar[0];
        if (file.size > 200 * 1024) {
          throw new Error('Profile picture must be less than 200KB');
        }

        const fileExtension = file.name.split('.').pop();
        const fileName = `avatars/${user.uid}/${Date.now()}.${fileExtension}`;
        const avatarRef = ref(storage, fileName);
        await uploadBytes(avatarRef, file);
        avatarUrl = await getDownloadURL(avatarRef);
      }

      // First, update the username in the usernames collection if changed
      if (formData.username.toLowerCase() !== userProfile.username.toLowerCase()) {
        // Remove old username
        if (userProfile.username) {
          await setDoc(doc(db, 'usernames', userProfile.username.toLowerCase()), {
            uid: null,
            username: null
          });
        }

        // Add new username
        await setDoc(doc(db, 'usernames', formData.username.toLowerCase()), {
          uid: user.uid,
          username: formData.username.toLowerCase()
        });
      }

      // Then update the user profile
      const updatedProfile = {
        displayName: formData.displayName,
        username: formData.username.toLowerCase(),
        bio: formData.bio || '',
        avatarUrl,
        email: user.email,
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });

      setUserProfile(prev => ({
        ...prev!,
        ...updatedProfile
      }));

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  {userProfile?.avatarUrl ? (
                    <AvatarImage src={userProfile.avatarUrl} alt={userProfile.displayName} />
                  ) : (
                    <AvatarFallback>
                      {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{userProfile?.displayName}</CardTitle>
                  <CardDescription>@{userProfile?.username}</CardDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
              >
                {isEditingProfile ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingProfile ? (
              <form onSubmit={handleSubmitProfile(handleProfileUpdate)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    {...registerProfile('displayName', { required: 'Display name is required' })}
                  />
                  {profileErrors.displayName && (
                    <p className="text-sm text-destructive">{profileErrors.displayName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    {...registerProfile('username', {
                      required: 'Username is required',
                      pattern: {
                        value: /^[a-zA-Z0-9_]{3,20}$/,
                        message: 'Username must be 3-20 characters and can only contain letters, numbers, and underscores'
                      }
                    })}
                    className={
                      usernameStatus.isChecking 
                        ? 'opacity-50' 
                        : usernameStatus.isValid 
                          ? 'border-green-500' 
                          : 'border-red-500'
                    }
                  />
                  {usernameStatus.isChecking ? (
                    <p className="text-sm text-muted-foreground">Checking availability...</p>
                  ) : (
                    <p className={`text-sm ${usernameStatus.isValid ? 'text-green-500' : 'text-red-500'}`}>
                      {usernameStatus.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    {...registerProfile('bio')}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture (Max 200KB)</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    {...registerProfile('avatar')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 200KB
                  </p>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !usernameStatus.isValid || usernameStatus.isChecking}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {userProfile?.bio ? (
                  <div>
                    <Label>Bio</Label>
                    <p className="text-muted-foreground">{userProfile.bio}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No bio provided</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild>
            <a 
              href="https://tally.so/r/w5pePN"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg"
            >
              Submit Your Startup
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}