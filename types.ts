
export type GuestCategory = string;

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  category: GuestCategory;
  adults: number;
  children: number;
  tableId: string | null;
  confirmed: boolean;
  color?: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  name?: string;
  position: { x: number; y: number };
  rotation?: number;
  type: 'round' | 'rectangular' | 'long';
}

export type HallElementType = 'stage' | 'dance_floor' | 'bar' | 'buffet' | 'entrance' | 'dj' | 'wall' | 'plant';

export interface HallElement {
  id: string;
  type: HallElementType;
  label: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation?: number;
}

export interface HallTemplate {
  id: string;
  name: string;
  createdBy: string; // username
  tables: Omit<Table, 'id'>[]; // Template tables don't need guests assigned
  elements: HallElement[];
  width: number;
  height: number;
}

export interface EventData {
  id: string;
  name: string;
  date: string;
  venue: string;
  address?: string;
  imageUrl?: string;
  guests: Guest[];
  tables: Table[];
  elements: HallElement[]; // Custom elements for this specific event
  categories: string[];
  whatsappTemplate?: string;
  hallTemplateId?: string;
}

export interface CustomApiConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface UserAccount {
  username: string;
  password?: string;
  events: EventData[];
  hallTemplates?: HallTemplate[];
  isAdmin?: boolean;
  apiConfig?: CustomApiConfig;
}

export interface AppState {
  currentUser: string | null;
  currentEventId: string | null;
  showWelcome: boolean;
  isApiEnabled?: boolean;
  lastUpdated?: string;
}
