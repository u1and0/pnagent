import { z } from "npm:zod@3.24.2";
import {
  SELECTABLE_HISTORY_FIELD,
  SELECTABLE_PROJECT_FIELD,
  SELECTABLE_STOCK_FIELD,
} from "./constants.ts";

// Zod スキーマ
export const StockSearchSchema = z.object({
  品番: z.string().optional().describe("Parts ID, 3-digit alpabet - numbers"),
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
    // build*SearchUrl()でselectの中から強制的に選ばせるのであえてoptional
    "sort by selected row, you MUST select just only one",
  ),
  limit: z.number().optional().describe("result max number"),
  asc: z.boolean().optional().describe("sort order ascending"),
  distinct: z.boolean().optional().describe("Do not show duplicate results"),
});

export const HistorySearchSchema = z.object({
  製番: z.string().optional().describe("Project ID"),
  工事名称: z.string().optional().describe(
    "Project name, another name '製番名称'",
  ),
  出庫指示番号: z.string().optional().describe("Order ID"),
  品番: z.string().optional().describe("Parts ID"),
  品名: z.string().optional().describe("Parts name, Japanese name"),
  型式: z.string().optional().describe("Parts model name, alphabet or number"),
  装置名: z.string().optional().describe("Device ID"),
  号機: z.string().optional().describe(
    "Serial ID for client.Alphabetical 3-digit",
  ),
  メーカ: z.string().optional().describe("Maker name"),
  仕入先: z.string().optional().describe("Vendor name"),
  select: z.enum(SELECTABLE_HISTORY_FIELD)
    .array().optional()
    .describe(
      `Set the key to be displayed in JSON as the value of select.
Select the minimum number of columns necessary. `,
    ),
  orderby: z.enum(SELECTABLE_HISTORY_FIELD).optional().describe(
    // build*SearchUrl()でselectの中から強制的に選ばせるのであえてoptional
    "sort by selected row, you MUST select just only one",
  ),
  limit: z.number().optional().describe("result max number"),
  asc: z.boolean().optional().describe("sort order ascending"),
  distinct: z.boolean().optional().describe("Do not show duplicate results"),
});

export const ProjectSearchSchema = z.object({
  製番: z.string().optional().describe("Project ID"),
  製番名称: z.string().optional().describe("Project name"),
  "受注・試作番号": z.string().optional().describe("Order/Prototype number"),
  select: z.enum(SELECTABLE_PROJECT_FIELD)
    .array().optional()
    .describe(
      `Set the key to be displayed in JSON as the value of select.
Select the minimum number of columns necessary. `,
    ),
  orderby: z.enum(SELECTABLE_PROJECT_FIELD).optional().describe(
    // build*SearchUrl()でselectの中から強制的に選ばせるのであえてoptional
    "sort by selected row, you MUST select just only one",
  ),
  limit: z.number().optional().describe("result max number"),
  asc: z.boolean().optional().describe("sort order ascending"),
  distinct: z.boolean().optional().describe("Do not show duplicate results"),
});

const RequestHeaderSchema = z.object({
  発注区分: z.string(),
  製番: z.string(),
  製番名称: z.string(),
  要求年月日: z.string(),
  製番納期: z.string(),
  ファイル名: z.string(),
  要求元: z.string(),
  備考: z.string(),
});

const RequestOrdersSchema = z.array(z.object({
  Lv: z.number(),
  品番: z.string(),
  品名: z.string(),
  型式: z.string(),
  在庫数: z.number(),
  数量: z.number(),
  単位: z.string(),
  要望納期: z.string(),
  検区: z.string(),
  装置名: z.string(),
  号機: z.string(),
  メーカ: z.string(),
  要望先: z.string(),
  予定単価: z.number(),
  Price: z.number(),
}));

export const RequestToolSchema = z.object({
  header: RequestHeaderSchema,
  orders: RequestOrdersSchema,
});

// 型定義
export type StockField = typeof SELECTABLE_STOCK_FIELD[number];
export type HistoryField = typeof SELECTABLE_HISTORY_FIELD[number];
export type ProjectField = typeof SELECTABLE_PROJECT_FIELD[number];
export type StockSearchParams = z.infer<typeof StockSearchSchema>;
export type HistorySearchParams = z.infer<typeof HistorySearchSchema>;
export type ProjectSearchParams = z.infer<typeof ProjectSearchSchema>;
export type RequestToolParams = z.infer<typeof RequestToolSchema>;

export interface FetchOptions {
  timeout?: number;
  retries?: number;
}

export interface FetchResult<T = any> {
  url: string;
  result: T | string;
  success: boolean;
}

export interface Sheet {
  config: Record<string, boolean>;
  header: Record<string, string>;
  body: Array<Record<string, string | number>>;
}
