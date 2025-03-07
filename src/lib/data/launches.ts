import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Launch } from '../types/launch';

// Static launches
const staticLaunches: Launch[] = [
  {
    id: 'TouchBase-46',
    name: 'TouchBase',
    logo: '/images/TouchBase.png',
    description: 'Stay connected with the people who matter most.',
    launchDate: '2025-03-02',
    website: 'https://touchbase.site/',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Simpler-45',
    name: 'Simpler ',
    logo: '/images/Simpler.png',
    description: 'Web-based workflow editor for creating, managing, and sharing automated workflows with AI integration.',
    launchDate: '2025-03-02',
    website: 'https://seeksimpler.com/',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'APIWORX Integration Services-44',
    name: 'APIWORX Integration Services',
    logo: '/images/APIWORX.png',
    description: 'APIWORX is a next-generation Integration as a Service (IaaS) platform that seamlessly connects eCommerce, ERP, and fulfillment systems with AI-driven automation and real-time data synchronization',
    launchDate: '2025-03-02',
    website: 'https://apiworx.com/',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Best Free Tools-43',
    name: 'Best Free Tools',
    logo: '/images/Best Free Tools.png',
    description: 'Best Free Tools',
    launchDate: '2025-03-02',
    website: 'https://www.bestfreetools.io/',
    category: 'directory',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Dear Coloring Pages-42',
    name: 'Dear Coloring Pages',
    logo: '/images/Dear Coloring Pages.png',
    description: 'Beautiful AI-Generated Coloring Pages for Everyone',
    launchDate: '2025-03-02',
    website: 'https://dearcoloringpages.com',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Cogniba-41',
    name: 'Cogniba',
    logo: '/images/Cogniba.png',
    description: 'The only form of brain training that works',
    launchDate: '2025-03-02',
    website: 'https://www.cogniba.com/',
    category: 'productivity',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'IndiePitcher-40',
    name: 'IndiePitcher',
    logo: '/images/IndiePitcher.png',
    description: 'Everything email for your startup with markdown support',
    launchDate: '2025-03-02',
    website: 'https://indiepitcher.com',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'everfind-39',
    name: 'everfind',
    logo: '/images/everfind.png',
    description: 'Find information across all your connected apps like Jira, Gmail, Gdrive.',
    launchDate: '2025-03-02',
    website: 'https://everfind.ai',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'BskyInfo-38',
    name: 'BskyInfo',
    logo: '/images/BskyInfo.png',
    description: 'The Most Comprehensive Bluesky Tools Directory',
    launchDate: '2025-03-02',
    website: 'https://www.bskyinfo.com/',
    category: 'directory',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Socialrails-37',
    name: 'Socialrails',
    logo: '/images/socialrails.png',
    description: 'Schedule to 9 social media platforms in seconds',
    launchDate: '2025-03-02',
    website: 'https://socialrails.com/',
    category: 'productivity',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Undervalued-36',
    name: 'Undervalued',
    logo: '/images/Undervalued.png',
    description: 'AI that Finds Value (Stock Market)',
    launchDate: '2025-03-02',
    website: 'https://undervalued.ai',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Ashdeck-35',
    name: 'Ashdeck',
    logo: '/images/Ashdeck.png',
    description: 'Ashdeck helps you stay focused by blocking distracting websites, using a Pomodoro timer for structured work sessions, and tracking your progress',
    launchDate: '2025-03-02',
    website: 'https://www.ashdeck.com',
    category: 'productivity',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'TheBlue.social-34',
    name: 'TheBlue.social',
    logo: '/images/TheBlue.social.png',
    description: 'Tools for Bluesky',
    launchDate: '2025-03-02',
    website: 'https://theblue.social',
    category: 'directory',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Uptimebeats-33',
    name: 'Uptimebeats',
    logo: '/images/Uptimebeats.png',
    description: 'Uptime monitoring tools and status pages',
    launchDate: '2025-03-02',
    website: 'https://uptimebeats.com',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Openmark-32',
    name: 'Openmark',
    logo: '/images/Openmark.png',
    description: 'Brand your vision with free, professional, open-source logos hand-crafted for todays product creators.',
    launchDate: '2025-03-02',
    website: 'https://www.openmark.co/',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Component Libraries-31',
    name: 'Component Libraries',
    logo: '/images/Component Libraries.png',
    description: 'The only platform for the best component libraries across all frameworks',
    launchDate: '2025-03-02',
    website: 'https://componentlibraries.com',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'DomoAI-30',
    name: 'DomoAI',
    logo: '/images/DomoAI.png',
    description: 'AI video editor that converts videos, text, and images into animation. Make your character move as you want.',
    launchDate: '2025-03-02',
    website: 'https://domoai.app/',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'aijobflow-29',
    name: 'Aijobflow',
    logo: '/images/aijobflow.jpg',
    description: 'Find Your Next Career-Defining Opportunities. Smart matching and AI tools to make your journey problem free.',
    launchDate: '2025-03-02',
    website: 'https://www.aijobflow.com',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Xply-28',
    name: 'Xply',
    logo: '/images/Xply.png',
    description: 'Xply helps you dominate your niche on X by finding high-value posts to engage with',
    launchDate: '2025-03-02',
    website: 'https://www.xply.app',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Narkis.ai-27',
    name: 'Narkis.ai',
    logo: '/images/Narkis.jpeg',
    description: 'Narkis.ai: Your AI Photo Studio.',
    launchDate: '2025-03-02',
    website: 'https://narkis.ai/',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Mapsemble-26',
    name: 'Mapsemble',
    logo: '/images/Mapsemble.png',
    description: 'Build and embed interactive maps based with your own dataset, using XLS, CSV, Geojson or API.',
    launchDate: '2025-03-02',
    website: 'https://Mapsemble.com',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: false
  },
  {
    id: 'Microsaaslink-1',
    name: 'Microsaaslink',
    logo: '/images/android-chrome-512x512.png',
    description: 'Uncover Hidden MicroSaaS Opportunities by analyzing established SaaS pain points and turning them into profitable micro-products',
    launchDate: '2025-02-16',
    website: 'https://microsaasl.ink',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'Directonaut-2',
    name: 'Directonaut',
    logo: 'images/Directonaut.png',
    description: 'Expert marketing guidance meets AI power for bootstrapped success',
    launchDate: '2025-02-16',
    website: 'https://directonaut.com',
    category: 'marketing',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'AllyMatter-3',
    name: 'AllyMatter',
    logo: 'images/AllyMatter Logo.png',
    description: 'Knowledge base tool built for internal teams',
    launchDate: '2025-02-16',
    website: 'https://allymatter.com',
    category: 'productivity',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'Smartpictures-4',
    name: 'Smartpictures',
    logo: 'images/Smartpictures.png',
    description: 'Smartpictures.ai generates realistic professional headshots in just 10 minutes.',
    launchDate: '2025-02-16',
    website: 'https://smartpictures.ai/',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'NextUpKit-5',
    name: 'NextUpKit',
    logo: 'images/nextupkit.png',
    description: 'Affordable & Fully-Featured Next.js SaaS Starter Kit',
    launchDate: '2025-02-16',
    website: 'https://www.nextupkit.com/',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'Devterms-6',
    name: 'Devterms',
    logo: '/images/Devterms.png',
    description: 'Tech is everywhere and understanding technical jargon can be overwhelming for beginners and non-tech users',
    launchDate: '2025-02-16',
    website: 'https://www.devterms.ai/',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'Whisperin-7',
    name: 'Whisperin',
    logo: '/images/Whisperin.png',
    description: 'Transform speech into optimized posts',
    launchDate: '2025-02-16',
    website: 'https://www.korelabstech.com/whisperin',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'Cairnify-8',
    name: 'Cairnify',
    logo: '/images/Cairnify.png',
    description: 'Cairnify is a personalized search engine for advanced queries, quick access, and smarter navigation.',
    launchDate: '2025-02-16',
    website: 'https://cairnify.com',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'InDocify-9',
    name: 'InDocify',
    logo: '/images/InDocify.jpeg',
    description: 'No More Digging Through Code, Just Ask',
    launchDate: '2025-02-16',
    website: 'https://www.indocify.com/',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'WebCull-10',
    name: 'WebCull',
    logo: '/images/WebCull.png',
    description: 'WebCull is a secure, end-to-end encrypted bookmark manager for organizing and syncing your links.',
    launchDate: '2025-02-16',
    website: 'https://webcull.com/',
    category: 'productivity',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'Snowpixel-11',
    name: 'Snowpixel',
    logo: '/images/Snowpixel.png',
    description: 'Generative Media Toolkit',
    launchDate: '2025-02-16',
    website: 'https://snowpixel.app/',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'Spurvo-12',
    name: 'Spurvo',
    logo: '/images/Spurvo.png',
    description: 'Its a tool that helps early founders and product teams capture and centralise feedback from different sources and create voting-based roadmaps & changelogs.',
    launchDate: '2025-02-16',
    website: 'https://spurvo.com/',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'DMconvo-13',
    name: 'DMconvo',
    logo: '/images/DMconvo.jpeg',
    description: 'Turn Your Instagram DMs into a 24/7 Sales Machine—Without Lifting a Finger',
    launchDate: '2025-02-16',
    website: 'https://dmconvo.ai',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'SynchNotes-14',
    name: 'SynchNotes',
    logo: '/images/synchnotesLogo2.png',
    description: 'Simplify your meeting summaries and tasks in a calendar view',
    launchDate: '2025-02-16',
    website: 'https://synchnotes.com/',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'MX Suite-15',
    name: 'MX Suite',
    logo: '/images/MX Suite.png',
    description: 'MX Suite isnt just another warming service—its an all-in-one email platform. ',
    launchDate: '2025-02-16',
    website: 'https://mxsuite.co',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'Ezihost-16',
    name: 'Ezihost',
    logo: '/images/ezilogo.png',
    description: 'Upload and share your Landing Page, PDFs and more for free ',
    launchDate: '2025-02-16',
    website: 'https://ezihost.org',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'Typersguild-17',
    name: 'Typersguild',
    logo: '/images/Web_Photo_Editor (2) (1).jpg',
    description: 'Master touch typing by typing out classic novels',
    launchDate: '2025-02-16',
    website: 'https://typersguild.com',
    category: 'productivity',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'Growmefy-18',
    name: 'Growmefy',
    logo: '/images/Growmefy.png',
    description: 'Growmefy helps you collect more reviews on Google, Trustpilot, Tripadvisor, and more, improving your online presence and local SEO.',
    launchDate: '2025-02-16',
    website: 'https://growmefy.com',
    category: 'business',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'DeutschDictionary-19',
    name: 'Deutsch Dictionary',
    logo: '/images/DeutschDictionary.png',
    description: 'DeutschDictionary is a free tool for learning German with translations, conjugations, and example sentences.',
    launchDate: '2025-02-16',
    website: 'https://deutschdictionary.com',
    category: 'productivity',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'Squirrel-20',
    name: 'Squirrel',
    logo: '/images/squirrel120x120.png',
    description: 'Our AI Agent team that replaces the need for internal recruiters or ATS systems, automating hiring for startups',
    launchDate: '2025-02-16',
    website: 'https://usesquirrel.com',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'RevenueFlo-21',
    name: 'RevenueFlo',
    logo: '/images/RevenueFlo.png',
    description: 'RevenueFlo helps subscription apps get more paying customers by offering smart discounts at the right time.',
    launchDate: '2025-02-16',
    website: 'https://revenueflo.com/',
    category: 'Business',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'Amber-22',
    name: 'Amber',
    logo: '/images/Amber.png',
    description: 'Cursor for Creative Writing',
    launchDate: '2025-02-16',
    website: 'withamber.com',
    category: 'Ai tool',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'Indie Launch-23',
    name: 'Indie Launch',
    logo: '/images/Indie Launch.jpg',
    description: 'Convert Visitors into Customers with IndieLaunch Template',
    launchDate: '2025-02-16',
    website: 'https://www.getindielaunch.com/',
    category: 'Business',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'AutoContent API-24',
    name: 'AutoContent API',
    logo: '/images/AutoContent API.png',
    description: 'Create NotebookLM podcasts from websites, YouTube videos or PDF documents',
    launchDate: '2025-02-16',
    website: 'https://autocontentapi.com/',
    category: 'API',
    listingType: 'regular',
    doFollowBacklink: true
  },
  {
    id: 'StuffToSponsor-25',
    name: 'StuffToSponsor',
    logo: '/images/StuffToSponsor.jpg',
    description: 'Discover Top Sites to Buy Ad Spots',
    launchDate: '2025-02-16',
    website: 'StuffToSponsor.com',
    category: 'Business',
    listingType: 'regular',
    doFollowBacklink: true
  }
];

// Function to get all launches including approved ones from Firestore
export async function getLaunches(): Promise<Launch[]> {
  try {
    // Get approved startups from Firestore
    const startupsRef = collection(db, 'startups');
    const q = query(startupsRef, where('status', '==', 'approved'));
    const querySnapshot = await getDocs(q);
    
    const approvedLaunches: Launch[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      
      // Get upvotes data
      const launchRef = doc(db, 'launches', docSnapshot.id);
      const launchDoc = await getDoc(launchRef);
      const upvoteData = launchDoc.exists() ? launchDoc.data() : { upvotes: 0, upvotedBy: [] };

      approvedLaunches.push({
        id: docSnapshot.id,
        name: data.name,
        logo: data.logoUrl,
        description: data.description,
        launchDate: data.scheduledLaunchDate.toDate().toISOString(),
        website: data.url,
        category: data.category || 'New Launch',
        listingType: data.listingType || 'regular',
        doFollowBacklink: true,
        upvotes: upvoteData.upvotes || 0,
        upvotedBy: upvoteData.upvotedBy || []
      });
    }

    // Add upvotes data to static launches
    const staticLaunchesWithUpvotes = await Promise.all(
      staticLaunches.map(async (launch) => {
        const launchRef = doc(db, 'launches', launch.id);
        const launchDoc = await getDoc(launchRef);
        const upvoteData = launchDoc.exists() ? launchDoc.data() : { upvotes: 0, upvotedBy: [] };
        
        return {
          ...launch,
          upvotes: upvoteData.upvotes || 0,
          upvotedBy: upvoteData.upvotedBy || []
        };
      })
    );

    // Combine static and approved launches
    return [...staticLaunchesWithUpvotes, ...approvedLaunches];
  } catch (error) {
    console.error('Error fetching launches:', error);
    return staticLaunches;
  }
}

// Function to get weekly launches
export async function getWeeklyLaunches(): Promise<Launch[]> {
  const launches = await getLaunches();
  
  // Get current date
  const now = new Date();
  
  // Find the start of the current week (Sunday at 00:00:00)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Find the end of the week (Saturday at 23:59:59)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return launches.filter(launch => {
    const launchDate = new Date(launch.launchDate);
    return launchDate >= startOfWeek && launchDate <= endOfWeek;
  });
}
