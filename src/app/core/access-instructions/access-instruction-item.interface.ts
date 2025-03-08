import {WidgetAssistant} from "../interfaces/widget-assistant.interface";

/**
 * Enum defining the types of instruction items
 */
export enum InstructionType {
  ACCESS_MODE = 'ACCESS_MODE',
  IDENTITY_CHECK = 'IDENTITY_CHECK',
  ARRIVAL_INSTRUCTION = 'ARRIVAL_INSTRUCTION'
}

/**
 * Union type of all possible access instruction item types
 */
export type AccessInstructionItem = AccessModeItem | IdentityCheckItem | ArrivalInstructionItem;

/**
 * Base interface for all instruction items with common properties
 */
export interface BaseInstructionItem {
  step: number;
  title: string;
  description: string;
  videoUrl?: string;
  images?: string[];
  list?: string[];
  type: InstructionType;
}

/**
 * Access mode information with specific code access details
 */
export interface AccessModeItem extends BaseInstructionItem {
  type: InstructionType.ACCESS_MODE;
  methodType: AccessMethodTypeEnum;
  codeAccess: {
    code: string;
    expiresAt: string;
    status: CodeAccessStatusEnum;
  };
}

/**
 * Identity verification information
 */
export interface IdentityCheckItem extends BaseInstructionItem {
  type: InstructionType.IDENTITY_CHECK;
  needToCheck: boolean;
  checkLink?: string;
}

/**
 * Instructions for arrival at the property
 */
export interface ArrivalInstructionItem extends BaseInstructionItem {
  type: InstructionType.ARRIVAL_INSTRUCTION;
  // This interface only contains base properties
}

/**
 * Document information for required guest documents
 */
export interface Document {
  label: string;
  documentType: DocumentTypeEnum;
  fileUrl?: string;
  status?: DocumentTypeStatusEnum;
  uploadedAt?: string;
}

/**
 * Main interface that contains all access instructions
 */
export interface AccessInstructions {
  title: string;
  messages?: WidgetAssistant;
  status: AccessInstructionsStatusEnum;
  instructions: Array<AccessInstructionItem>;
  documents?: Document[];
  checkinContacts?: CheckinContactItem[];
}

/**
 * Contact information for check-in process
 */
export interface CheckinContactItem {
  order: number;
  value: string;
  type: CheckinContactsEnum;
  icon?: string;
  label?: string;
}

/**
 * Types of contact methods available for check-in
 */
export enum CheckinContactsEnum {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
}

/**
 * Status of access codes
 */
export enum CodeAccessStatusEnum {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED'
}

/**
 * Types of access methods available
 */
export enum AccessMethodTypeEnum {
  KEY_BOX = 'KEY_BOX',
  SMART_LOCK = 'SMART_LOCK',
  KEY = 'KEY'
}

/**
 * Status of submitted documents
 */
export enum DocumentTypeStatusEnum {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

/**
 * Types of documents that can be submitted
 */
export enum DocumentTypeEnum {
  CNI = 'CNI',
  PASSPORT = 'PASSPORT',
  PERMIS = 'PERMIS',
  ACTE_MARIAGE = 'ACTE_MARIAGE',
}

/**
 * Overall status of access instructions
 */
export enum AccessInstructionsStatusEnum {
  DONE = 'DONE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}
