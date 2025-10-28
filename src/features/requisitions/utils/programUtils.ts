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