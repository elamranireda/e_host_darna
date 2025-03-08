import {AccessInstructions} from "../access-instructions/access-instruction-item.interface";

export interface Property {
  id: string;
  name: string;
  type?: string;
  hostId?: string;
  description: string;
  coverImage: string;
  avatar: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  location: {
    latitude: string | number;
    longitude: string | number;
  };
  checkInInfo: {
    checkInStart: string;
    checkInEnd: string;
    checkOutTime: string;
    accessInstructions: AccessInstructions;
    parkingInstructions?: ParikingInstructions;
    wifiInstructions?: WifiInstructions;
    amenities?: string[];
    houseRules?: string[];
    emergencyContacts?: {
      category: string;
      name: string;
      phone: string;
      email: string;
    }[]
  };
  wifiInstructions?: string;
  amenities?: string[];
  houseRules?: string[];
  emergencyContacts?: {
    category: string;
    name: string;
    phone: string;
    email: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WifiInstructions {
  name: string;
  code: string;
  type: string;
  speed: string;
  free: boolean;
  cost: number;
  instructions: string;
}

export interface ParikingInstructions {
  type: string;
  free: boolean;
  cost: number;
  instructions: string;
  openingHours: string;
  numberOfVehicles: number;
  photo: string;
  placeNumber: string;
}

export interface PropertyInstruction {
  id: string;
  name: string;
  title: string;
  category: 'appliance' | 'entertainment' | 'kitchen' | 'bathroom' | 'bedroom' | 'living-room' | 'outdoor' | 'other';
  steps: {
    step: number;
    instruction: string;
    imageUrl?: string;
  }[];
  videoUrl?: string;
}

export interface NearByPlace {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  type: 'restaurant' | 'bar' | 'cafe' | 'museum' | 'park' | 'shopping' | 'other';
  openingHours: string;
  phone: string;
  website: string;
  email: string;
  priceLevel: number;
  rating: number;
  photo: string;
  reviews: {};
  distance: number;
  images: string[];
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'appliance' | 'heating' | 'cooling' | 'pest-control' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  images?: string[];
  createdAt: string;
  resolvedAt?: string;
  notes: string;
  rating: number;
}
