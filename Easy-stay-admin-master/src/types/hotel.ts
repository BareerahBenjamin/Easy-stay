// src/types/hotel.ts
export type Role = 'merchant' | 'admin';

export type HotelStatus = 'auditing' | 'approved' | 'rejected' | 'published' | 'offline';

export interface RoomType {
  id: string;
  name: string;
  price: number;
  discount?: number; // 例如 0.8 = 8折
}

export interface Hotel {
  id: string;
  merchantId: string;
  nameZh: string;
  nameEn: string;
  address: string;
  starLevel: number;
  roomTypes: RoomType[];
  openTime: string;
  images: string[];
  nearby: string;
  discounts: string;
  status: HotelStatus;
  rejectReason?: string;
  createdAt: string;
}