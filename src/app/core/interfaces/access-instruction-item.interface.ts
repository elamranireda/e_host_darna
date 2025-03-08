import {WidgetAssistant} from "./widget-assistant.interface";

export type AccessInstructionItem = | AccessModeItem | IdentityCHeckItem | ArrivalInstructionItem;

export interface AccessModeItem {
  step: number;
  description: string;
  videoUrl?: string;
  images?: string[];
  title: string;
  list?: string[];
  methodeType: AccessMethodeTypeEnum;
  codeAccess: {
    code: string;
    expiresAt: string;
    status: CodeAccessStatusEnum;
  };
}

export interface IdentityCHeckItem {
  step: number;
  title: string;
  description: string;
  needToCheck: boolean;
  checkLink?: string;
  videoUrl?: string;
  list?: string[];
  images?: string[];
  methodeType?: AccessMethodeTypeEnum;
  codeAccess?: {
    code: string;
    expiresAt: string;
    status: CodeAccessStatusEnum;
  };
}

export interface ArrivalInstructionItem {
  step: number;
  title: string;
  description: string;
  videoUrl?: string;
  list?: string[];
  images?: string[];
  methodeType?: AccessMethodeTypeEnum;
  codeAccess?: {
    code: string;
    expiresAt: string;
    status: CodeAccessStatusEnum;
  };
}

export interface Document {
  label: string;
  documentType: DocumentTypeEnum;
  fileUrl?: string;
  status?: DocumentTypeStatusEnum;
  uploadedAt?: string;
}

export interface AccessInstructions {
  title: string;
  messages?: WidgetAssistant;
  status: AccessInstructionsStatusEnum;
  instructions: Array<AccessInstructionItem>;
  documents?: Document[];
  checkinContacts?: CheckinContactItem[]
}

export interface CheckinContactItem {
  order: number,
  value: string,
  type: CheckinContactsEnum,
  icon?: string,
  label?: string
}

export enum CheckinContactsEnum {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
}

export enum CodeAccessStatusEnum {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED'
}

export enum AccessMethodeTypeEnum {
  KEY_BOX = 'KEY_BOX',
  SMART_LOCK = 'SMART_LOCK',
  KEY = 'KEY'

}

export enum DocumentTypeStatusEnum {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'

}

export enum DocumentTypeEnum {
  CNI = 'CNI',
  PASSPORT = 'PASSPORT',
  PERMIS = 'PERMIS',
  ACTE_MARIAGE = 'ACTE_MARIAGE',

}

export enum AccessInstructionsStatusEnum {
  DONE = 'DONE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}
