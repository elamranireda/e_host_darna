import { Injectable } from '@angular/core';
import {
  AccessInstructionItem,
  AccessModeItem,
  IdentityCheckItem,
  ArrivalInstructionItem,
  AccessMethodTypeEnum,
  AccessInstructions,
  InstructionType
} from './access-instruction-item.interface';

/**
 * Service for working with access instructions data
 * Provides type guards and helper methods for access instructions
 */
@Injectable({
  providedIn: 'root'
})
export class AccessInstructionsService {

  /**
   * Type guard to check if an instruction item is an AccessModeItem
   * @param item The instruction item to check
   * @returns True if the item is an AccessModeItem
   */
  isAccessModeItem(item: AccessInstructionItem): item is AccessModeItem {
    return item.type === InstructionType.ACCESS_MODE;
  }

  /**
   * Type guard to check if an instruction item is an IdentityCheckItem
   * @param item The instruction item to check
   * @returns True if the item is an IdentityCheckItem
   */
  isIdentityCheckItem(item: AccessInstructionItem): item is IdentityCheckItem {
    return item.type === InstructionType.IDENTITY_CHECK;
  }

  /**
   * Type guard to check if an instruction item is an ArrivalInstructionItem
   * @param item The instruction item to check
   * @returns True if the item is an ArrivalInstructionItem
   */
  isArrivalInstructionItem(item: AccessInstructionItem): item is ArrivalInstructionItem {
    return item.type === InstructionType.ARRIVAL_INSTRUCTION;
  }

  /**
   * Converts legacy instruction items to typed instruction items
   * This is useful when receiving data from APIs that don't yet include the type property
   * @param instructions Array of potentially untyped instructions
   * @returns Array of properly typed instructions
   */
  ensureInstructionsHaveTypes(instructions: any[]): AccessInstructionItem[] {
    if (!instructions || !instructions.length) {
      return [];
    }
    
    return instructions.map(instruction => {
      // If it already has a valid type, return as is
      if (instruction.type && Object.values(InstructionType).includes(instruction.type)) {
        return instruction;
      }
      
      // Determine the type based on properties
      let type: InstructionType;
      
      if ('methodType' in instruction || 'methodeType' in instruction || 'codeAccess' in instruction) {
        type = InstructionType.ACCESS_MODE;
        
        // Fix legacy property name
        if ('methodeType' in instruction && !('methodType' in instruction)) {
          instruction.methodType = instruction.methodeType;
          delete instruction.methodeType;
        }
      } else if ('needToCheck' in instruction) {
        type = InstructionType.IDENTITY_CHECK;
      } else {
        type = InstructionType.ARRIVAL_INSTRUCTION;
      }
      
      // Return a new object with the type added
      return { ...instruction, type };
    });
  }

  /**
   * Sort instructions by step number in ascending order
   * @param instructions The array of instructions to sort
   * @returns A new sorted array of instructions
   */
  sortInstructionsByStep<T extends AccessInstructionItem>(instructions: T[]): T[] {
    if (!instructions || !instructions.length) {
      return [];
    }
    
    return [...instructions].sort((a, b) => a.step - b.step);
  }

  /**
   * Get all access mode items from the instructions
   * @param instructions The access instructions object
   * @param sort Whether to sort the results by step (default: true)
   * @returns Array of AccessModeItem objects
   */
  getAccessModeItems(instructions: AccessInstructions, sort = true): AccessModeItem[] {
    if (!instructions || !instructions.instructions) {
      return [];
    }
    
    const items = instructions.instructions.filter(item => 
      this.isAccessModeItem(item)) as AccessModeItem[];
    
    return sort ? this.sortInstructionsByStep(items) : items;
  }

  /**
   * Get all identity check items from the instructions
   * @param instructions The access instructions object
   * @param sort Whether to sort the results by step (default: true)
   * @returns Array of IdentityCheckItem objects
   */
  getIdentityCheckItems(instructions: AccessInstructions, sort = true): IdentityCheckItem[] {
    if (!instructions || !instructions.instructions) {
      return [];
    }
    
    const items = instructions.instructions.filter(item => 
      this.isIdentityCheckItem(item)) as IdentityCheckItem[];
    
    return sort ? this.sortInstructionsByStep(items) : items;
  }

  /**
   * Get all arrival instruction items from the instructions
   * @param instructions The access instructions object
   * @param sort Whether to sort the results by step (default: true)
   * @returns Array of ArrivalInstructionItem objects
   */
  getArrivalInstructionItems(instructions: AccessInstructions, sort = true): ArrivalInstructionItem[] {
    if (!instructions || !instructions.instructions) {
      return [];
    }
    
    const items = instructions.instructions.filter(item => 
      this.isArrivalInstructionItem(item)) as ArrivalInstructionItem[];
    
    return sort ? this.sortInstructionsByStep(items) : items;
  }

  /**
   * Get all instructions sorted by step
   * @param instructions The access instructions object
   * @returns A new array of all instructions sorted by step
   */
  getAllInstructionsSorted(instructions: AccessInstructions): AccessInstructionItem[] {
    if (!instructions || !instructions.instructions) {
      return [];
    }
    
    // Ensure all instructions have types before sorting
    const typedInstructions = this.ensureInstructionsHaveTypes(instructions.instructions);
    return this.sortInstructionsByStep(typedInstructions);
  }

  /**
   * Check if access code is expired
   * @param item The access mode item to check
   * @returns True if the access code is expired
   */
  isAccessCodeExpired(item: AccessModeItem): boolean {
    if (!item.codeAccess || !item.codeAccess.expiresAt) {
      return false;
    }
    
    const expiryDate = new Date(item.codeAccess.expiresAt);
    return expiryDate < new Date();
  }

  /**
   * Get access items filtered by method type
   * @param instructions The access instructions object
   * @param methodType The method type to filter by
   * @param sort Whether to sort the results by step (default: true)
   * @returns Array of AccessModeItem objects matching the method type
   */
  getAccessItemsByMethodType(
    instructions: AccessInstructions, 
    methodType: AccessMethodTypeEnum,
    sort = true
  ): AccessModeItem[] {
    const accessItems = this.getAccessModeItems(instructions, false);
    const filteredItems = accessItems.filter(item => item.methodType === methodType);
    
    return sort ? this.sortInstructionsByStep(filteredItems) : filteredItems;
  }
}
