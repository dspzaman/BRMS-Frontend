// src/features/requisitions/utils/programUtils.ts

/**
 * User program info from AuthContext
 */
interface UserProgramInfo {
  program_id: number;
  program: string;
  role_in_program: string;
  is_primary: boolean;
}

/**
 * Auto-select default program based on user's program assignments
 * 
 * Logic:
 * - If user has only 1 program → auto-select it
 * - If user has multiple programs → auto-select primary (if exists)
 * - Otherwise → return null (user must select manually)
 * 
 * @param programs - Array of user's program assignments
 * @returns Program ID to auto-select, or null
 */
export function getDefaultProgram(programs: UserProgramInfo[]): number | null {
  if (!programs || programs.length === 0) {
    return null;
  }
  
  if (programs.length === 1) {
    // Only one program - auto-select it
    return programs[0].program_id;
  }
  
  // Multiple programs - select primary if exists
  const primaryProgram = programs.find(p => p.is_primary);
  return primaryProgram ? primaryProgram.program_id : null;
}

/**
 * Common organizational addresses for travel expense autocomplete
 * Add more addresses as needed
 */
export const COMMON_ADDRESSES = [
  "AHC - 10578 113 St #100, Edmonton, AB T5H 3H5",
  // Add more common addresses here as needed
  // "Office Name - Full Address",
];

/**
 * Filter addresses based on user input (client-side, instant)
 * 
 * @param query - User's search query
 * @param limit - Maximum number of suggestions to return
 * @returns Filtered address suggestions
 */
export function filterAddressSuggestions(query: string, limit: number = 10): string[] {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  return COMMON_ADDRESSES
    .filter(address => address.toLowerCase().includes(searchTerm))
    .slice(0, limit);
}