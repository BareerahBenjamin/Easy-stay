import { create } from "zustand";
import { apiGet, apiPatch, apiPost } from "../lib/apiClient";
import { Hotel, HotelStatus } from "../types/hotel";

type AuditStatus = "PENDING" | "APPROVED" | "REJECTED";

interface CRoom {
  id: string;
  name: string;
  price: number;
  breakfast: boolean;
  cancelPolicy: string;
  stock: number;
}

interface CHotel {
  id: string;
  merchantId?: string;
  name: string;
  city: string;
  district: string;
  address: string;
  description: string;
  starRating: number;
  minPrice: number;
  maxPrice: number;
  auditStatus: AuditStatus;
  isOnline: boolean;
  offlineReason?: string;
  tagIds: string[];
  facilities: string[];
  images: string[];
  rooms: CRoom[];
  updatedAt: string;
}

const CITY_BY_MERCHANT: Record<string, string> = {
  "u-merchant-shanghai": "上海",
  "u-merchant-beijing": "北京",
  "u-merchant-shenzhen": "深圳"
};

function toAdminStatus(auditStatus: AuditStatus, isOnline: boolean): HotelStatus {
  if (auditStatus === "PENDING") return "auditing";
  if (auditStatus === "REJECTED") return "rejected";
  if (auditStatus === "APPROVED" && isOnline) return "published";
  if (auditStatus === "APPROVED" && !isOnline) return "approved";
  return "offline";
}

function toAuditStatus(status: HotelStatus): AuditStatus {
  if (status === "auditing") return "PENDING";
  if (status === "rejected") return "REJECTED";
  return "APPROVED";
}

function toOnline(status: HotelStatus): boolean {
  return status === "published";
}

function mapCHotelToAdmin(hotel: CHotel): Hotel {
  const cityPart = hotel.city || "未填写城市";
  return {
    id: hotel.id,
    merchantId: hotel.merchantId || "shared-merchant",
    nameZh: hotel.name,
    nameEn: "",
    address: hotel.address,
    starLevel: hotel.starRating,
    roomTypes: hotel.rooms.map((room) => ({
      id: room.id,
      name: room.name,
      price: room.price,
      discount: undefined
    })),
    openTime: hotel.updatedAt.slice(0, 10),
    images: hotel.images,
    nearby: `${cityPart} · ${hotel.district}`,
    discounts: "",
    status: toAdminStatus(hotel.auditStatus, hotel.isOnline),
    rejectReason: hotel.offlineReason,
    createdAt: hotel.updatedAt
  };
}

function mapAdminToCHotel(hotel: Omit<Hotel, "id" | "createdAt"> & { id?: string }): CHotel {
  const roomPrices = hotel.roomTypes.map((room) => room.price);
  const minPrice = roomPrices.length ? Math.min(...roomPrices) : 199;
  const maxPrice = roomPrices.length ? Math.max(...roomPrices) : 399;
  const city = CITY_BY_MERCHANT[hotel.merchantId] || "上海";

  return {
    id: hotel.id || `h-admin-${Date.now()}`,
    merchantId: hotel.merchantId,
    name: hotel.nameZh,
    city,
    district: "核心商圈",
    address: hotel.address,
    description: hotel.discounts || `${hotel.nameZh}（${hotel.nameEn || "Easy Stay"}）`,
    starRating: hotel.starLevel || 4,
    minPrice,
    maxPrice,
    auditStatus: toAuditStatus(hotel.status),
    isOnline: toOnline(hotel.status),
    offlineReason: hotel.rejectReason,
    tagIds: ["t-001"],
    facilities: ["免费 Wi-Fi", "24h 前台", "行李寄存"],
    images: hotel.images.length ? hotel.images : ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
    rooms: hotel.roomTypes.map((room, index) => ({
      id: room.id || `r-admin-${Date.now()}-${index}`,
      name: room.name,
      price: room.price,
      breakfast: true,
      cancelPolicy: "入住前一天 18:00 前可免费取消",
      stock: 10
    })),
    updatedAt: new Date().toISOString()
  };
}

interface HotelStore {
  hotels: Hotel[];
  loading: boolean;
  error: string;
  refreshHotels: () => Promise<void>;
  addHotel: (hotel: Omit<Hotel, "id" | "createdAt">) => Promise<void>;
  updateHotel: (id: string, data: Partial<Hotel>) => Promise<void>;
  getMerchantHotels: (merchantId: string) => Hotel[];
  getAllHotels: () => Hotel[];
}

export const useHotelStore = create<HotelStore>()((set, get) => ({
  hotels: [],
  loading: false,
  error: "",

  refreshHotels: async () => {
    set({ loading: true, error: "" });
    try {
      const result = await apiGet<CHotel[] | { data: CHotel[] }>("/hotels");
      const rows = Array.isArray(result) ? result : result.data;
      set({ hotels: rows.map(mapCHotelToAdmin), loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载酒店失败";
      set({ error: message, loading: false });
    }
  },

  addHotel: async (hotel) => {
    const payload = mapAdminToCHotel(hotel);
    await apiPost<CHotel>("/hotels", payload);
    await get().refreshHotels();
  },

  updateHotel: async (id, data) => {
    const current = get().hotels.find((hotel) => hotel.id === id);
    if (!current) return;
    const merged: Hotel = { ...current, ...data };
    const payload = mapAdminToCHotel({ ...merged, id });
    await apiPatch<CHotel>(`/hotels/${id}`, payload);
    await get().refreshHotels();
  },

  getMerchantHotels: (merchantId) => get().hotels.filter((hotel) => hotel.merchantId === merchantId),
  getAllHotels: () => get().hotels
}));
