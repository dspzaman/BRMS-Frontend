// src/features/requisitions/ui/fields/TravelExpenseRow.tsx
import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import type { RequisitionFormData } from "../../model/types";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useTravelRates, getRateForDate, useTravelExpenseTypes } from "../../api/useTravelRates";
import { apiClient } from "@/shared/api/client";

interface TravelExpenseRowProps {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

export function TravelExpenseRow({ index, onRemove, canRemove }: TravelExpenseRowProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<RequisitionFormData>();
  const { user } = useAuth();
  
  // Get programs from user context
  const programs = user?.programs || [];
  
  // Fetch travel expense types (category + code combinations)
  const { data: travelExpenseTypes, isLoading: isLoadingTypes } = useTravelExpenseTypes();
  
  // Fetch all travel rates
  const { data: travelRates, isLoading: isLoadingRates } = useTravelRates();

  // Watch fields for calculations
  const expenseCodeAssignment = watch(`travelExpenses.${index}.expenseCodeAssignment`);
  const travelDate = watch(`travelExpenses.${index}.travelDate`);
  const totalKm = watch(`travelExpenses.${index}.totalKm`);
  const ratePerKm = watch(`travelExpenses.${index}.ratePerKm`);
  
  // Watch address fields for autocomplete
  const startAddress = watch(`travelExpenses.${index}.startAddress`);
  const endAddress = watch(`travelExpenses.${index}.endAddress`);
  
  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  
  // Fetch address suggestions
  const fetchAddressSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setAddressSuggestions([]);
      return;
    }
    
    setIsLoadingAddresses(true);
    try {
      const response = await apiClient.get<string[]>(
        '/api/expense-tracking/form-data/travel-address-suggestions/',
        { params: { q: query, limit: 10 } }
      );
      setAddressSuggestions(response.data);
    } catch (error) {
      console.error('Failed to fetch address suggestions:', error);
      setAddressSuggestions([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };
  
  // Watch for changes in start address and fetch suggestions
  useEffect(() => {
    if (startAddress) {
      fetchAddressSuggestions(startAddress);
    }
  }, [startAddress]);
  
  // Watch for changes in end address and fetch suggestions
  useEffect(() => {
    if (endAddress) {
      fetchAddressSuggestions(endAddress);
    }
  }, [endAddress]);

  // Auto-select Program Delivery travel type as default
  useEffect(() => {
    if (travelExpenseTypes && !expenseCodeAssignment) {
      // Find the Program Delivery option (parent_category_name = "Program Delivery")
      const programDeliveryType = travelExpenseTypes.find(
        type => type.parent_category_name === "Program Delivery"
      );
      if (programDeliveryType) {
        setValue(`travelExpenses.${index}.expenseCodeAssignment`, programDeliveryType.id);
      }
    }
  }, [travelExpenseTypes, expenseCodeAssignment, index, setValue]);
  
  // Update rate when travel date changes
  useEffect(() => {
    if (travelDate && travelRates) {
      const rate = getRateForDate(travelRates, travelDate);
      setValue(`travelExpenses.${index}.ratePerKm`, rate);
    }
  }, [travelDate, travelRates, index, setValue]);
  
  // Calculate amount: totalKm × ratePerKm
  const calculateAmount = () => {
    const km = parseFloat(totalKm) || 0;
    const rate = parseFloat(ratePerKm) || 0;
    return (km * rate).toFixed(2);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Travel Expense #{index + 1}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Remove
          </button>
        )}
      </div>

      {/* Form Fields Grid - Single Row */}
      <div className="grid grid-cols-12 gap-3">
        {/* Program */}
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Program <span className="text-red-500">*</span>
          </label>
          <select
            {...register(`travelExpenses.${index}.program`, {
              required: "Program is required",
              valueAsNumber: true,
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
          >
            <option value="">Select program</option>
            {programs.map((prog, idx) => (
              <option key={idx} value={prog.program_id}>
                {prog.program}
              </option>
            ))}
          </select>
          {errors.travelExpenses?.[index]?.program && (
            <p className="mt-1 text-xs text-red-600">
              {errors.travelExpenses[index]?.program?.message}
            </p>
          )}
        </div>
        
        {/* Expense Type (Category + Code) */}
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Expense Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register(`travelExpenses.${index}.expenseCodeAssignment`, {
              required: "Expense type is required",
              valueAsNumber: true,
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
            disabled={isLoadingTypes}
          >
            <option value="">Select expense type</option>
            {travelExpenseTypes?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.display_name}
              </option>
            ))}
          </select>
          {errors.travelExpenses?.[index]?.expenseCodeAssignment && (
            <p className="mt-1 text-xs text-red-600">
              {errors.travelExpenses[index]?.expenseCodeAssignment?.message}
            </p>
          )}
        </div>

        {/* Travel Date */}
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register(`travelExpenses.${index}.travelDate`, {
              required: "Date is required",
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
          />
          {errors.travelExpenses?.[index]?.travelDate && (
            <p className="mt-1 text-xs text-red-600">
              {errors.travelExpenses[index]?.travelDate?.message}
            </p>
          )}
        </div>

        {/* Start Address */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            From <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            list={`start-address-suggestions-${index}`}
            {...register(`travelExpenses.${index}.startAddress`, {
              required: "Start location is required",
            })}
            placeholder="Start typing..."
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
          />
          {errors.travelExpenses?.[index]?.startAddress && (
            <p className="mt-1 text-xs text-red-600">
              {errors.travelExpenses[index]?.startAddress?.message}
            </p>
          )}
          <datalist id={`start-address-suggestions-${index}`}>
            {addressSuggestions.map((suggestion, idx) => (
              <option key={idx} value={suggestion} />
            ))}
          </datalist>
        </div>

        {/* End Address */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            To <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            list={`end-address-suggestions-${index}`}
            {...register(`travelExpenses.${index}.endAddress`, {
              required: "Destination is required",
            })}
            placeholder="Start typing..."
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
          />
          {errors.travelExpenses?.[index]?.endAddress && (
            <p className="mt-1 text-xs text-red-600">
              {errors.travelExpenses[index]?.endAddress?.message}
            </p>
          )}
          <datalist id={`end-address-suggestions-${index}`}>
            {addressSuggestions.map((suggestion, idx) => (
              <option key={idx} value={suggestion} />
            ))}
          </datalist>
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register(`travelExpenses.${index}.description`, {
              required: "Description is required",
            })}
            placeholder="Purpose"
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
          />
          {errors.travelExpenses?.[index]?.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.travelExpenses[index]?.description?.message}
            </p>
          )}
        </div>

        {/* Total KM */}
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            KM <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register(`travelExpenses.${index}.totalKm`, {
              required: "KM is required",
            })}
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
          />
          {errors.travelExpenses?.[index]?.totalKm && (
            <p className="mt-1 text-xs text-red-600">
              {errors.travelExpenses[index]?.totalKm?.message}
            </p>
          )}
        </div>

        {/* Rate per KM */}
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Rate
          </label>
          <input
            type="text"
            {...register(`travelExpenses.${index}.ratePerKm`)}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-600"
            title={isLoadingRates ? 'Loading rate...' : 'Rate per kilometer'}
          />
        </div>

        {/* Amount */}
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Amt
          </label>
          <input
            type="text"
            value={calculateAmount()}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-ems-green-50 text-ems-green-700 font-bold"
          />
        </div>
      </div>
    </div>
  );
}