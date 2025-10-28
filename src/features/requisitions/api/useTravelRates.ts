// src/features/requisitions/api/useTravelRates.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { TravelRate, TravelExpenseType } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Generic function to fetch rates by type(s)
 * @param rateTypes - Comma-separated rate types (e.g., 'travel_per_km' or 'meal_breakfast,meal_lunch,meal_dinner')
 */
async function fetchRatesByType(rateTypes: string): Promise<Record<string, TravelRate[]>> {
  const response = await apiClient.get<Record<string, TravelRate[]>>(
    `/api/expense-tracking/form-data/rates/?rate_type=${rateTypes}`
  );
  return response.data;
}

/**
 * React Query hook to fetch travel per kilometer rates
 */
export function useTravelRates(): { data: TravelRate[] | undefined; isLoading: boolean; error: any } {
  const { data, isLoading, error } = useQuery<Record<string, TravelRate[]>>({
    queryKey: ['rates', 'travel_per_km'],
    queryFn: () => fetchRatesByType('travel_per_km'),
    staleTime: 5 * 60 * 1000, // 5 minutes - rates don't change often
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
  
  return {
    data: data?.travel_per_km,
    isLoading,
    error,
  };
}

/**
 * React Query hook to fetch all meal rates (breakfast, lunch, dinner)
 */
export function useMealRates(): { 
  data: { breakfast?: TravelRate[]; lunch?: TravelRate[]; dinner?: TravelRate[] } | undefined; 
  isLoading: boolean; 
  error: any 
} {
  const { data, isLoading, error } = useQuery<Record<string, TravelRate[]>>({
    queryKey: ['rates', 'meal_breakfast,meal_lunch,meal_dinner'],
    queryFn: () => fetchRatesByType('meal_breakfast,meal_lunch,meal_dinner'),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  
  return {
    data: data ? {
      breakfast: data.meal_breakfast,
      lunch: data.meal_lunch,
      dinner: data.meal_dinner,
    } : undefined,
    isLoading,
    error,
  };
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

// NOTE: useTravelExpenseTypes has been moved to useExpenseTypes.ts
// Import from there: import { useTravelExpenseTypes } from './useExpenseTypes';