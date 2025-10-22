// src/features/requisitions/api/useTravelRates.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { TravelRate, TravelExpenseType } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Fetch all travel per kilometer rates from the backend
 */
async function fetchTravelRates(): Promise<TravelRate[]> {
  const response = await apiClient.get<TravelRate[]>(
    '/api/expense-tracking/form-data/travel-rates/'
  );
  return response.data;
}

/**
 * React Query hook to fetch and cache travel rates
 */
export function useTravelRates(): { data: TravelRate[] | undefined; isLoading: boolean; error: any } {
  return useQuery<TravelRate[]>({
    queryKey: ['travelRates'],
    queryFn: fetchTravelRates,
    staleTime: 5 * 60 * 1000, // 5 minutes - rates don't change often
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

/**
 * Get the appropriate rate for a specific travel date
 * @param rates - Array of travel rates
 * @param date - Travel date in YYYY-MM-DD format
 * @returns The rate as a string (e.g., "0.6800")
 */
export function getRateForDate(rates: TravelRate[] | undefined, date: string): string {
  if (!date || !rates || rates.length === 0) {
    return '0.68'; // Default fallback
  }
  
  // Find the rate where date falls within start_date and end_date range
  const matchingRate = rates.find(rate => {
    const travelDate = new Date(date);
    const startDate = new Date(rate.start_date);
    const endDate = rate.end_date ? new Date(rate.end_date) : null;
    
    // Check if travel date is >= start_date
    if (travelDate < startDate) {
      return false;
    }
    
    // Check if travel date is <= end_date (or end_date is null/open-ended)
    if (endDate && travelDate > endDate) {
      return false;
    }
    
    return true;
  });
  
  return matchingRate?.rate || '0.68'; // Return rate or default
}

/**
 * Fetch travel expense types (category + code combinations)
 */
async function fetchTravelExpenseTypes(): Promise<TravelExpenseType[]> {
  const response = await apiClient.get<TravelExpenseType[]>(
    '/api/expense-tracking/form-data/travel-expense-types/'
  );
  return response.data;
}

/**
 * React Query hook to fetch travel expense types
 */
export function useTravelExpenseTypes(): { data: TravelExpenseType[] | undefined; isLoading: boolean; error: any } {
  return useQuery<TravelExpenseType[]>({
    queryKey: ['travelExpenseTypes'],
    queryFn: fetchTravelExpenseTypes,
    staleTime: 10 * 60 * 1000, // 10 minutes - rarely changes
    refetchOnWindowFocus: false,
  });
}