// src/features/requisitions/api/usePayeeData.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { StaffMember, Vendor, CardHolder } from './types';

/**
 * React Query hook to fetch active staff members
 */
export function useActiveStaff() {
  return useQuery<StaffMember[]>({
    queryKey: ['activeStaff'],
    queryFn: async () => {
      const response = await apiClient.get('/api/accounts/form-data/active-staff/');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to fetch active vendors (excluding contractors)
 * Filters: vendor_type != 'contractor'
 */
export function useActiveVendors() {
  return useQuery<Vendor[]>({
    queryKey: ['activeVendors'],
    queryFn: async () => {
      const response = await apiClient.get('/api/accounts/form-data/active-vendors/');
      // Filter out contractors on the frontend
      const vendors = response.data as Vendor[];
      return vendors.filter(vendor => vendor.vendor_type.toLowerCase() !== 'contractor');
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to fetch active contractors only
 * Filters: vendor_type = 'contractor'
 */
export function useActiveContractors() {
  return useQuery<Vendor[]>({
    queryKey: ['activeContractors'],
    queryFn: async () => {
      const response = await apiClient.get('/api/accounts/form-data/active-vendors/');
      // Filter only contractors on the frontend
      const vendors = response.data as Vendor[];
      return vendors.filter(vendor => vendor.vendor_type.toLowerCase() === 'contractor');
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to fetch active card holders
 */
export function useActiveCardHolders() {
  return useQuery<CardHolder[]>({
    queryKey: ['activeCardHolders'],
    queryFn: async () => {
      const response = await apiClient.get('/api/accounts/form-data/active-card-holders/');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}