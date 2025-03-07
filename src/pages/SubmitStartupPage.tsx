import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const categories = [
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'design', label: 'Design' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'for-sale', label: 'For Sale' }
];

interface SubmissionFormData {
  name: string;
  url: string;
  socialHandle: string;
  description: string;
  category: string;
  logo: FileList;
}

export function SubmitStartupPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SubmissionFormData>();
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Watch the logo field to show preview and validate size
  const logoFile = watch('logo');

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024) { // 200KB in bytes
        toast({
          title: 'Error',
          description: 'Logo file must be less than 200KB',
          variant: 'destructive',
        });
        event.target.value = '';
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please upload an image file',
          variant: 'destructive',
        });
        event.target.value = '';
        return;
      }
    }
  };

  const onSubmit = async (data: SubmissionFormData) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to submit your startup',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload logo first
      const file = data.logo[0];
      const logoRef = ref(storage, `startup-logos/${Date.now()}_${file.name}`);
      await uploadBytes(logoRef, file);
      const logoUrl = await getDownloadURL(logoRef);

      // Add startup to Firestore with pending status
      const startupRef = collection(db, 'startups');
      await addDoc(startupRef, {
        name: data.name,
        url: data.url,
        socialHandle: data.socialHandle,
        description: data.description,
        category: selectedCategory,
        logoUrl,
        userId: user.uid,
        status: 'pending', // Always set initial status as pending
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      toast({
        title: 'Success!',
        description: 'Your startup has been submitted and is pending review. We will notify you once it is approved.',
      });

      // Redirect to profile page where they can see their submission status
      navigate('/profile');
    } catch (error) {
      console.error('Error submitting startup:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit startup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Startup</CardTitle>
              <CardDescription>
                Fill out the form below to submit your startup for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Startup Name *</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Startup name is required' })}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Website URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    {...register('url', { 
                      required: 'Website URL is required',
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL starting with http:// or https://'
                      }
                    })}
                  />
                  {errors.url && (
                    <p className="text-sm text-destructive">{errors.url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialHandle">Social Media Handle *</Label>
                  <Input
                    id="socialHandle"
                    {...register('socialHandle', { required: 'Social media handle is required' })}
                  />
                  {errors.socialHandle && (
                    <p className="text-sm text-destructive">{errors.socialHandle.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description *</Label>
                  <Input
                    id="description"
                    {...register('description', { 
                      required: 'Description is required',
                      maxLength: {
                        value: 200,
                        message: 'Description must be less than 200 characters'
                      }
                    })}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem 
                          key={category.value} 
                          value={category.value}
                        >
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Logo * (Max 200KB)</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    {...register('logo', { 
                      required: 'Logo is required'
                    })}
                    onChange={handleLogoChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Please upload a square logo (recommended size: 100x100px)
                  </p>
                  {errors.logo && (
                    <p className="text-sm text-destructive">{errors.logo.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || !selectedCategory}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Startup'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
