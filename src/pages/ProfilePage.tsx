import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SubmittedStartup } from '@/lib/types';
import { useSubmissions } from '@/lib/hooks/useSubmissions';

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { submissions: submittedStartups, isLoading: isLoadingSubmissions } = useSubmissions(user?.uid);
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

  const username = watchProfile('username');

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

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

  const debouncedCheckUsername = debounce(checkUsername, 500);

  useEffect(() => {
    if (username) {
      debouncedCheckUsername(username);
    }
  }, [username]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data() as UserProfile;
          setUserProfile(profileData);
          
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

      if (formData.username.toLowerCase() !== userProfile.username.toLowerCase()) {
        if (userProfile.username) {
          await setDoc(doc(db, 'usernames', userProfile.username.toLowerCase()), {
            uid: null,
            username: null
          });
        }

        await setDoc(doc(db, 'usernames', formData.username.toLowerCase()), {
          uid: user.uid,
          username: formData.username.toLowerCase()
        });
      }

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="submissions">My Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
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
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>My Startup Submissions</CardTitle>
                <CardDescription>
                  Track the status of your submitted startups
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submittedStartups.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You haven't submitted any startups yet</p>
                    <Button asChild>
                      <a href="https://tally.so/r/w5pePN" target="_blank" rel="noopener noreferrer">
                        Submit Your First Startup
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submittedStartups.map((startup) => (
                      <Card key={startup.id} className="p-4">
                        <div className="flex items-start gap-4">
                          <img 
                            src={startup.logoUrl} 
                            alt={startup.name} 
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold">{startup.name}</h3>
                                <p className="text-sm text-muted-foreground">{startup.description}</p>
                              </div>
                              <Badge variant={getStatusBadgeVariant(startup.status)}>
                                {startup.status.charAt(0).toUpperCase() + startup.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="mt-2 space-y-1 text-sm">
                              <p>Submitted: {formatDate(startup.submittedAt)}</p>
                              {startup.scheduledLaunchDate && startup.status === 'approved' && (
                                <p className="text-primary">
                                  {startup.listingType === 'regular' 
                                    ? `Scheduled for launch: ${formatDate(startup.scheduledLaunchDate)}`
                                    : `Launched on: ${formatDate(startup.scheduledLaunchDate)}`
                                  }
                                </p>
                              )}
                              {startup.listingType && startup.status === 'approved' && (
                                <Badge variant="outline" className="mt-2">
                                  {startup.listingType.charAt(0).toUpperCase() + startup.listingType.slice(1)} Listing
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
