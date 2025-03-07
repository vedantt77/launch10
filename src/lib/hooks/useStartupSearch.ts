import { useState, useMemo } from 'react';
import type { Startup } from '@/lib/types';

export function useStartupSearch(startups: Startup[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStartups = useMemo(() => 
    startups.filter((startup) =>
      startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.category.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [startups, searchQuery]
  );

  return {
    searchQuery,
    setSearchQuery,
    filteredStartups
  };
}