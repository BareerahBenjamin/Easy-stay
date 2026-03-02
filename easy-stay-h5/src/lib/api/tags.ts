import { request } from "./client";
import type { Tag } from "./types";

export async function getTags(): Promise<Tag[]> {
  const response = await request<Tag[]>("/tags");
  return response.data;
}
