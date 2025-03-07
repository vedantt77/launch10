import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SubmittedStartup } from '@/lib/types';

type ListingType = 'regular' | 'boosted' | 'premium';

export function AdminDashboard() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingStartups, setPendingStartups] = useState<SubmittedStartup[]>([]);
  const [approvedStartups, setApprovedStartups] = useState<SubmittedStartup[]>([]);
  const [rejectedStartups, setRejectedStartups] = useState<SubmittedStartup[]>([]);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null);
  const [selectedListingType, setSelectedListingType] = useState<ListingType>('regular');
  const [isReapproveDialogOpen, setIsReapproveDialogOpen] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const adminDoc = await getDocs(query(
          collection(db, 'admins'),
          where('userId', '==', user.uid)
        ));

        if (adminDoc.empty) {
          navigate('/');
          return;
        }

        setIsAdmin(true);
        fetchStartups();
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  const fetchStartups = async () => {
    try {
      const startupsRef = collection(db, 'startups');
      const [pendingSnap, approvedSnap, rejectedSnap] = await Promise.all([
        getDocs(query(startupsRef, where('status', '==', 'pending'))),
        getDocs(query(startupsRef, where('status', '==', 'approved'))),
        getDocs(query(startupsRef, where('status', '==', 'rejected')))
      ]);

      const pending: SubmittedStartup[] = [];
      const approved: SubmittedStartup[] = [];
      const rejected: SubmittedStartup[] = [];

      pendingSnap.forEach(doc => {
        const data = doc.data();
        pending.push({
          id: doc.id,
          name: data.name,
          url: data.url,
          socialHandle: data.socialHandle,
          description: data.description,
          logoUrl: data.logoUrl,
          submittedAt: data.createdAt.toDate(),
          scheduledLaunchDate: data.scheduledLaunchDate?.toDate(),
          status: data.status
        });
      });

      approvedSnap.forEach(doc => {
        const data = doc.data();
        approved.push({
          id: doc.id,
          name: data.name,
          url: data.url,
          socialHandle: data.socialHandle,
          description: data.description,
          logoUrl: data.logoUrl,
          submittedAt: data.createdAt.toDate(),
          scheduledLaunchDate: data.scheduledLaunchDate?.toDate(),
          status: data.status
        });
      });

      rejectedSnap.forEach(doc => {
        const data = doc.data();
        rejected.push({
          id: doc.id,
          name: data.name,
          url: data.url,
          socialHandle: data.socialHandle,
          description: data.description,
          logoUrl: data.logoUrl,
          submittedAt: data.createdAt.toDate(),
          scheduledLaunchDate: data.scheduledLaunchDate?.toDate(),
          status: data.status
        });
      });

      setPendingStartups(pending);
      setApprovedStartups(approved);
      setRejectedStartups(rejected);
    } catch (error) {
      console.error('Error fetching startups:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch startups',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNextLaunchDate = () => {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(0, 0, 0, 0);
    
    // If it's already past Wednesday, schedule for next week
    if (now.getDay() > 3) { // After Wednesday
      nextSunday.setDate(nextSunday.getDate() + 7);
    }
    
    return nextSunday;
  };

  const handleApproveClick = (startupId: string) => {
    setSelectedStartupId(startupId);
    setIsApproveDialogOpen(true);
  };

  const handleReapproveClick = (startupId: string) => {
    setSelectedStartupId(startupId);
    setIsReapproveDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedStartupId) return;

    try {
      const startupRef = doc(db, 'startups', selectedStartupId);
      const scheduledLaunchDate = selectedListingType === 'regular' 
        ? calculateNextLaunchDate() 
        : new Date(); // Immediate launch for premium/boosted

      await updateDoc(startupRef, {
        status: 'approved',
        listingType: selectedListingType,
        scheduledLaunchDate: Timestamp.fromDate(scheduledLaunchDate),
        updatedAt: Timestamp.now()
      });

      toast({
        title: 'Success',
        description: `Startup approved as ${selectedListingType} listing${selectedListingType === 'regular' ? ' and scheduled for next week' : ' and launched immediately'}`,
      });

      setIsApproveDialogOpen(false);
      setIsReapproveDialogOpen(false);
      setSelectedStartupId(null);
      setSelectedListingType('regular');
      fetchStartups();
    } catch (error) {
      console.error('Error updating startup status:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve startup',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (startupId: string) => {
    try {
      const startupRef = doc(db, 'startups', startupId);
      await updateDoc(startupRef, {
        status: 'rejected',
        updatedAt: Timestamp.now()
      });

      toast({
        title: 'Success',
        description: 'Startup rejected successfully',
      });

      fetchStartups();
    } catch (error) {
      console.error('Error updating startup status:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject startup',
        variant: 'destructive',
      });
    }
  };

  if (!isAdmin || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  const StartupCard = ({ startup }: { startup: SubmittedStartup }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <img 
              src={startup.logoUrl} 
              alt={startup.name} 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <CardTitle className="text-xl">{startup.name}</CardTitle>
              <CardDescription>
                Submitted on {startup.submittedAt.toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={
              startup.status === 'approved' ? 'success' :
              startup.status === 'rejected' ? 'destructive' :
              'secondary'
            }
          >
            {startup.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-muted-foreground">{startup.description}</p>
        <div className="flex flex-col gap-1">
          <a 
            href={startup.url}
            target="_blank"
            rel="noopener noreferrer" 
            className="text-primary hover:underline"
          >
            {startup.url}
          </a>
          <p className="text-sm text-muted-foreground">
            Social: {startup.socialHandle}
          </p>
          {startup.scheduledLaunchDate && (
            <p className="text-sm text-primary">
              Scheduled for launch on: {startup.scheduledLaunchDate.toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
      {startup.status === 'pending' && (
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => handleReject(startup.id)}
          >
            Reject
          </Button>
          <Button
            onClick={() => handleApproveClick(startup.id)}
          >
            Approve
          </Button>
        </CardFooter>
      )}
      {startup.status === 'rejected' && (
        <CardFooter className="flex justify-end">
          <Button
            onClick={() => handleReapproveClick(startup.id)}
          >
            Re-approve
          </Button>
        </CardFooter>
      )}
      {startup.status === 'approved' && (
        <CardFooter className="flex justify-end">
          <Button
            variant="destructive"
            onClick={() => handleReject(startup.id)}
          >
            Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  return (
    <>
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="pending">
                Pending ({pendingStartups.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedStartups.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedStartups.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingStartups.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending submissions
                </p>
              ) : (
                pendingStartups.map(startup => (
                  <StartupCard key={startup.id} startup={startup} />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved">
              {approvedStartups.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No approved submissions
                </p>
              ) : (
                approvedStartups.map(startup => (
                  <StartupCard key={startup.id} startup={startup} />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {rejectedStartups.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No rejected submissions
                </p>
              ) : (
                rejectedStartups.map(startup => (
                  <StartupCard key={startup.id} startup={startup} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isApproveDialogOpen || isReapproveDialogOpen} onOpenChange={(open) => {
        setIsApproveDialogOpen(open);
        setIsReapproveDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Listing Type</DialogTitle>
            <DialogDescription>
              Choose how this startup should be listed on the platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <RadioGroup
              value={selectedListingType}
              onValueChange={(value) => setSelectedListingType(value as ListingType)}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="regular" id="regular" />
                <Label htmlFor="regular">Regular Listing (Next Week)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="boosted" id="boosted" />
                <Label htmlFor="boosted">Boosted Listing (Immediate)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="premium" id="premium" />
                <Label htmlFor="premium">Premium Listing (Immediate)</Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApproveDialogOpen(false);
                setIsReapproveDialogOpen(false);
                setSelectedStartupId(null);
                setSelectedListingType('regular');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApproveConfirm}>
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
