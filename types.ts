import { z } from "npm:zod@3.24.2";
import {
  SELECTABLE_HISTORY_FIELD,
  SELECTABLE_STOCK_FIELD,
} from "./constants.ts";

// Zod スキーマ
export const StockSearchSchema = z.object({
  品番: z.string().optional().describe("Parts ID"),
  品名: z.string().optional().describe("Parts name, Japanese name"),
  型式: z.string().optional().describe("Parts model name, alphabet or number"),
  備考: z.string().optional().describe("Specification No like TB-12-A-034-001"),
  select: z.enum(SELECTABLE_STOCK_FIELD)
    .array().optional()
    .describe(
      `Set the key to be displayed in JSON as the value of select.
Select the minimum number of columns necessary. `,
    ),
  orderby: z.enum(SELECTABLE_STOCK_FIELD).optional().describe(
    "sort by selected row, select just only one",
  ),
  limit: z.number().optional().describe("result max number"),
  asc: z.boolean().optional().describe("sort order ascending"),
  distinct: z.boolean().optional().describe("Do not show duplicate results"),
});

export const HistorySearchSchema = z.object({
  製番: z.string().optional().describe("Project ID"),
  工事名称: z.string().optional().describe("Project name"),
  出庫指示番号: z.string().optional().describe("Order ID"),
  品番: z.string().optional().describe("Parts ID"),
  品名: z.string().optional().describe("Parts name, Japanese name"),
  型式: z.string().optional().describe("Parts model name, alphabet or number"),
  装置名: z.string().optional().describe("Device ID"),
  号機: z.string().optional().describe("Serial ID for client.Alphabetical 3-digit"),
  メーカ: z.string().optional().describe("Maker name"),
  仕入先: z.string().optional().describe("Vendor name"),
  select: z.enum(SELECTABLE_HISTORY_FIELD)
    .array().optional()
    .describe(
      `Set the key to be displayed in JSON as the value of select.
Select the minimum number of columns necessary. `,
    ),
  orderby: z.enum(SELECTABLE_HISTORY_FIELD).optional().describe(
    "sort by selected row, select just only one",
  ),
  limit: z.number().optional().describe("result max number"),
  asc: z.boolean().optional().describe("sort order ascending"),
  distinct: z.boolean().optional().describe("Do not show duplicate results"),
});

// 型定義
export type StockField = typeof SELECTABLE_STOCK_FIELD[number];
export type HistoryField = typeof SELECTABLE_HISTORY_FIELD[number];
export type StockSearchParams = z.infer<typeof StockSearchSchema>;
export type HistorySearchParams = z.infer<typeof HistorySearchSchema>;

export interface FetchOptions {
  timeout?: number;
  retries?: number;
}

export interface FetchResult<T = any> {
  url: string;
  result: T | string;
  success: boolean;
}
