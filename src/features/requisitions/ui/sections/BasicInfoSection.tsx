// src/features/requisitions/ui/sections/BasicInfoSection.tsx

import { useFormContext, Controller } from "react-hook-form";
import type { RequisitionFormData } from "../../model/types";
import { useEffect, useRef } from "react";
import { useActiveStaff, useActiveVendors, useActiveContractors, useActiveCardHolders } from "../../api/usePayeeData";

export function BasicInfoSection() {
  const { register, watch, setValue, control, formState: { errors } } = useFormContext<RequisitionFormData>();
  
  // Watch payee type to show appropriate dropdown
  const payeeType = watch('payeeType');
  const payeeId = watch('payeeId');
  
  // Track previous payeeType to detect actual changes
  const prevPayeeType = useRef<typeof payeeType>(payeeType);
  
  // Fetch data for dropdowns
  const { data: staffMembers, isLoading: isLoadingStaff } = useActiveStaff();
  const { data: vendors, isLoading: isLoadingVendors } = useActiveVendors();
  const { data: contractors, isLoading: isLoadingContractors } = useActiveContractors();
  const { data: cardHolders, isLoading: isLoadingCardHolders } = useActiveCardHolders();
  
  // Clear payeeId when payeeType actually changes (not on initial load)
  useEffect(() => {
    // Only clear if payeeType changed AND it's not the initial undefined -> value transition
    if (prevPayeeType.current !== undefined && prevPayeeType.current !== payeeType) {
      setValue('payeeId', null);
      setValue('payeeOther', '');
    }
    
    // Update the previous value
    prevPayeeType.current = payeeType;
  }, [payeeType, setValue]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Basic Information
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter the requisition date and payee information
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Row 1: Requisition Date and Payee Type */}
        <div className="grid grid-cols-2 gap-4">
          {/* Requisition Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requisition Date <span className="text-red-500">*</span>
            </label>
            <input 
              type="date"
              {...register('requisitionDate', {
                required: "Requisition date is required",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            />
            {errors.requisitionDate && (
              <p className="mt-1 text-xs text-red-600">
                {errors.requisitionDate.message}
              </p>
            )}
          </div>

          {/* Payee Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payee Type <span className="text-red-500">*</span>
            </label>
            <select 
              {...register('payeeType', {
                required: "Payee type is required",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            >
              <option value="">Select payee type</option>
              <option value="staff">Staff Member</option>
              <option value="vendor">Vendor</option>
              <option value="contractor">Contractor</option>
              <option value="office_credit_card">Office Credit Card</option>
              <option value="other">Other</option>
            </select>
            {errors.payeeType && (
              <p className="mt-1 text-xs text-red-600">
                {errors.payeeType.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Dynamic Payee Selection */}
        {payeeType && payeeType !== 'other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {payeeType === 'staff' && 'Select Staff Member'}
              {payeeType === 'vendor' && 'Select Vendor'}
              {payeeType === 'contractor' && 'Select Contractor'}
              {payeeType === 'office_credit_card' && 'Select Card Holder'}
              {' '}<span className="text-red-500">*</span>
            </label>
            
            {/* Staff Dropdown */}
            {payeeType === 'staff' && (
              <select 
                {...register('payeeId', {
                  required: "Please select a staff member",
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
                disabled={isLoadingStaff}
              >
                <option value="">
                  {isLoadingStaff ? 'Loading...' : 'Select staff member'}
                </option>
                {staffMembers?.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.full_name} ({staff.email})
                  </option>
                ))}
              </select>
            )}
            
            {/* Vendor Dropdown */}
            {payeeType === 'vendor' && (
              <select 
                {...register('payeeId', {
                  required: "Please select a vendor",
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
                disabled={isLoadingVendors}
              >
                <option value="">
                  {isLoadingVendors ? 'Loading...' : 'Select vendor'}
                </option>
                {vendors?.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.vendor_type}) ({vendor.vendor_code} - {vendor.email})
                  </option>
                ))}
              </select>
            )}
            
            {/* Contractor Dropdown */}
            {payeeType === 'contractor' && (
              <select 
                {...register('payeeId', {
                  required: "Please select a contractor",
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
                disabled={isLoadingContractors}
              >
                <option value="">
                  {isLoadingContractors ? 'Loading...' : 'Select contractor'}
                </option>
                {contractors?.map((contractor) => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.name} ({contractor.vendor_type} - {contractor.vendor_code} - {contractor.email})
                  </option>
                ))}
              </select>
            )}
            
            {/* Card Holder Dropdown */}
            {payeeType === 'office_credit_card' && (
              <select 
                {...register('payeeId', {
                  required: "Please select a card holder",
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
                disabled={isLoadingCardHolders}
              >
                <option value="">
                  {isLoadingCardHolders ? 'Loading...' : 'Select card holder'}
                </option>
                {cardHolders?.map((holder) => (
                  <option key={holder.id} value={holder.id}>
                    {holder.name} - {holder.card_type.charAt(0).toUpperCase() + holder.card_type.slice(1)} - {holder.card_number_last4}
                  </option>
                ))}
              </select>
            )}
            
            {errors.payeeId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.payeeId.message}
              </p>
            )}
          </div>
        )}
        
        {/* Other Payee - Text Input Only */}
        {payeeType === 'other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payee Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              {...register('payeeOther', {
                required: "Please enter payee name",
              })}
              placeholder="Enter payee name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            />
            {errors.payeeOther && (
              <p className="mt-1 text-xs text-red-600">
                {errors.payeeOther.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}