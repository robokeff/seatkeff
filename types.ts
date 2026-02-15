
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
  color: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  name?: string;
  position: { x: number; y: number };
  rotation?: number;
  type: 'round' | 'rectangular' | 'square';
  color?: string;
}

export type HallElementType = 'stage' | 'dance_floor' | 'bar' | 'buffet' | 'entrance' | 'dj' | 'wall' | 'plant';

export interface HallElement {
  id: string;
  type: HallElementType;
  label: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation?: number;
  color?: string;
}

export interface HallTemplate {
  id: string;
  name: string;
  createdBy: string;
  tables: Omit<Table, 'id'>[]; 
  elements: HallElement[];
  width: number;
  height: number;
}

export interface EventData {
  id: string;
  name: string;
  date: string;
  venue: string;
  eventTopic: string;
  address?: string;
  imageUrl?: string;
  guests: Guest[];
  tables: Table[];
  elements: HallElement[]; 
  categories: string[];
  seatingTemplate?: string;
  canvasWidth: number;
  canvasHeight: number;
  customRsvpUrl?: string; // שדה חדש לניהול קישור מותאם
}

export interface AppState {
  currentUser: string | null;
  currentEventId: string | null;
  showWelcome: boolean;
  lastUpdated?: string;
}

export interface UserAccount {
  username: string;
  password?: string;
  events: EventData[];
  hallTemplates?: HallTemplate[];
  isAdmin?: boolean;
}
