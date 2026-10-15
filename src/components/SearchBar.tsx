'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AREAS_OF_LAW } from '@/lib/constants';

const ALL = 'all';

interface SearchBarProps {
  jurisdictions: string[];
  years: string[];
}

export function SearchBar({ jurisdictions, years }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [term, setTerm] = React.useState(searchParams.get('q') ?? '');

  React.useEffect(() => {
    setTerm(searchParams.get('q') ?? '');
  }, [searchParams]);

  function pushParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === ALL) params.delete(key);
      else params.set(key, value);
    });

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const activeFilters = ['jurisdiction', 'area', 'year', 'q'].filter((key) => searchParams.get(key));

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          pushParams({ q: term.trim() || null });
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label className="sr-only" htmlFor="case-search">
            Search case briefs
          </label>
          <Input
            id="case-search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search by title, citation or subject, e.g. [2023] eKLR"
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="filter-jurisdiction">Court or county</Label>
          <Select
            value={searchParams.get('jurisdiction') ?? ALL}
            onValueChange={(value) => pushParams({ jurisdiction: value })}
          >
            <SelectTrigger id="filter-jurisdiction">
              <SelectValue placeholder="All courts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All courts</SelectItem>
              {jurisdictions.map((jurisdiction) => (
                <SelectItem key={jurisdiction} value={jurisdiction}>
                  {jurisdiction}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-area">Area of law</Label>
          <Select value={searchParams.get('area') ?? ALL} onValueChange={(value) => pushParams({ area: value })}>
            <SelectTrigger id="filter-area">
              <SelectValue placeholder="All areas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All areas</SelectItem>
              {AREAS_OF_LAW.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-year">Year of judgment</Label>
          <Select value={searchParams.get('year') ?? ALL} onValueChange={(value) => pushParams({ year: value })}>
            <SelectTrigger id="filter-year">
              <SelectValue placeholder="Any year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Any year</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFilters.length > 0 ? (
        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setTerm('');
              router.push(pathname);
            }}
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
          <span className="text-xs text-muted-foreground">
            {activeFilters.length} active {activeFilters.length === 1 ? 'filter' : 'filters'}
          </span>
        </div>
      ) : null}
    </div>
  );
}
