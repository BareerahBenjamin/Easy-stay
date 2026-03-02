import { request } from "./client";
import type { Hotel, HotelQueryParams, PagedResult } from "./types";

interface JsonServerV1Page<T> {
  data: T[];
  items: number;
  pages: number;
}

export async function getHotels(params: HotelQueryParams = {}): Promise<PagedResult<Hotel>> {
  const page = params._page ?? 1;
  const limit = params._limit ?? 10;
  const { _limit: _, ...rest } = params;
  const response = await request<Hotel[] | JsonServerV1Page<Hotel>>("/hotels", {
    query: {
      ...rest,
      _page: page,
      _per_page: limit
    }
  });

  let data: Hotel[] = [];
  let total = 0;

  if (Array.isArray(response.data)) {
    total = response.data.length;
    const start = (page - 1) * limit;
    data = response.data.slice(start, start + limit);
  } else {
    data = response.data.data;
    total = response.data.items;
  }

  return {
    data,
    pagination: {
      total,
      page,
      limit
    }
  };
}

export async function getHotelById(id: string): Promise<Hotel | null> {
  try {
    const response = await request<Hotel>(`/hotels/${id}`);
    return response.data;
  } catch {
    const response = await request<Hotel[]>("/hotels", {
      query: { id }
    });
    return response.data[0] ?? null;
  }
}
