/* FastMCPでURL, JSON系の操作
 *
 * [ 注意 ] deno check すると肘王に動作が重たい。メモリ不足によりクラッシュすることがあるため
 * deno run , deno test では --no-checkフラグが必要
 *
 * [ 注意 ] FastMCP使うときは deno run -A しないといけない。
 * --deny-envなどでenvを拒否するとツールを読み込んでくれない。
 *
 * [ 注意 ] コーディングエージェントに返す値は必ず
 * `JSON.stringify(json)` する必要がある。
 * FastMCPや本家MCPが必要と指定る型は次の形式
 * {
 *   content: [{
         type: "text",  // string
         text: ...      // string
 *   }]
 * }
 *
 * type: text以外だとまた違うのだろうか？
 */

import { FastMCP } from "npm:fastmcp@1.20.5";
import { z } from "npm:zod@3.24.2";

const server = new FastMCP({
  name: "PNAgent",
  version: "0.1.0",
});

const BASEURL = Deno.env.get("PNSEARCH_BASE") || "http://localhost:8080";
const APIV1 = BASEURL + "/api/v1";
const DEFAULT_LIMIT = 50;
const DEFAULT_ASC = false;
const DEFAULT_DISTINCT = false;

const SELECTABLE_STOCK_FIELD = [
  "品番",
  "品名",
  "型式",
  "在庫数",
  "単位",
  "在庫単価",
  "備考",
] as const;

const SELECTABLE_HISTORY_FIELD = [
  "製番",
  "製番枝番",
  "工事名称",
  "部品表行番号",
  "レベル",
  "出庫指示番号",
  "品番",
  "品名",
  "型式",
  "手配数量",
  "出庫数量",
  "受入数量",
  "発注数量",
  "原価計上数量",
  "単位",
  "部品表作成日",
  "手配納期",
  "出庫処理日",
  "受入日",
  "発注納期",
  "仕入先",
  "発注単価",
  "原価計上単価",
  "発注額",
  "原価計上額",
  "装置名",
  "号機",
  "メーカ",
  "備考",
  "発注処理者",
  "発注番号",
  "検区",
  "諸口品",
] as const;

interface FetchResult {
  url: string;
  //@ts-ignore: return any type JSON
  result: any;
}

async function fetchPNSearch(
  url: URL,
  options: { timeout?: number; retries?: number },
): Promise<FetchResult> {
  // parse option
  const { timeout = 10000, retries = 0 } = options;
  // ユーザーに対してもどんなURLが生成されたか見せるためにデコードする
  const decodedURL = decodeURIComponent(url.toString());
  // fetch with timout
  const controller = new AbortController();
  const timeoutID = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "Accept": "application/json" },
    });
    clearTimeout(timeoutID);
    // reponse NG
    if (response.status === 204 || !response.ok) {
      const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      return { url: decodedURL, result: errorMessage };
    }
    // response OK
    // Return the parsed JSON object
    const jsonResult = await response.json();
    return { url: decodedURL, result: jsonResult };
  } catch (error) {
    clearTimeout(timeoutID);
    if (error instanceof Error) {
      // タイムアウトエラー
      if (error.name === "AbortError") {
        const msg = `Request timeout after ${timeout}ms`;
        return { url: decodedURL, result: msg };
      }
      // TypeErrorかNetworkErrorならリトライ
      if (
        retries > 0 &&
        (error.name === "TypeError" || error.name === "NetworkError")
      ) {
        console.warn(
          `Retrying request to ${decodedURL}, attempts remaining: ${retries}`,
        );
        return fetchPNSearch(url, { timeout, retries: retries - 1 });
      }
      // その他のエラー
      console.error("Fetch error:", error);
      return { url: decodedURL, result: `Fetch error: ${error.message}` };
    }
    // Error以外の予期せぬエラー
    console.error("Unexpected error", error);
    return { url: decodedURL, result: `Unexpected error: ${error}` };
  }
}

// 在庫検索
server.addTool({
  name: "StockSearch",
  description: "ユーザーの入力を部品在庫検索用URLに変換して結果を返す",
  parameters: z.object({
    品番: z.string().optional().describe("Parts ID"),
    品名: z.string().optional().describe("Parts name, Japanese name"),
    型式: z.string().optional().describe(
      "Parts model name, alphabet or number",
    ),
    備考: z.string().optional().describe(
      "Specification No like TB-12-A-034-001",
    ),
    select: z.enum(SELECTABLE_STOCK_FIELD)
      .optional().array().describe(
        `Set the key to be displayed in JSON as the value of select.
  Select the minimum number of columns necessary. `,
      ),
    orderby: z.enum(SELECTABLE_STOCK_FIELD).optional().describe(
      "sort by selected row, select just only one",
    ),
    limit: z.number().optional().describe("result max number"),
    asc: z.boolean().optional().describe("sort order ascending"),
    distinct: z.boolean().optional().describe("Do not show duplicate results"),
  }),
  execute: async (params) => {
    // URL構築
    const url = new URL(`${APIV1}/filter/stock`);
    // 検索キーワード
    if (params.品番) url.searchParams.set("品番", params.品番);
    if (params.品名) url.searchParams.set("品名", params.品名);
    if (params.型式) url.searchParams.set("型式", params.型式);
    if (params.備考) url.searchParams.set("備考", params.備考);
    // 表示列
    SELECTABLE_STOCK_FIELD.forEach((field) => { // その他のフィールドは
      if (params.select.includes(field)) { // paramsにあれば適宜追加
        url.searchParams.append("select", field);
      }
    });
    // ソート列
    url.searchParams.set("orderby", params.orderby ?? "品番"); // orderby は必須
    url.searchParams.set("limit", String(params.limit ?? DEFAULT_LIMIT));
    url.searchParams.set("asc", String(params.asc ?? DEFAULT_ASC));
    // 重複非表示(デフォルトはすべて表示)
    url.searchParams.set(
      "distinct",
      String(params.distinct ?? DEFAULT_DISTINCT),
    );
    console.error("URL:", url);

    // fetchした結果をコーディングエージェントに返す
    const json = await fetchPNSearch(url, { timeout: 100000, retries: 3 });
    return JSON.stringify(json, null, 2);
  },
});

// 発注検索
server.addTool({
  name: "HistorySearch",
  description: "ユーザーの入力を部品発注履歴検索用URLに変換して結果を返す",
  parameters: z.object({
    製番: z.string().optional().describe("Project ID"),
    工事名称: z.string().optional().describe("Project name"),
    出庫指示番号: z.string().optional().describe("Order ID"),
    品番: z.string().optional().describe("Parts ID"),
    品名: z.string().optional().describe("Parts name, Japanese name"),
    型式: z.string().optional().describe(
      "Parts model name, alphabet or number",
    ),
    装置名: z.string().optional().describe("Device ID"),
    号機: z.string().optional().describe(
      "Serial ID for client.Alphabetical 3-digit",
    ),
    メーカ: z.string().optional().describe("Maker name"),
    仕入先: z.string().optional().describe("Vendor name"),
    select: z.enum(SELECTABLE_HISTORY_FIELD)
      .optional().array().describe(
        `Set the key to be displayed in JSON as the value of select.
  Select the minimum number of columns necessary. `,
      ),
    orderby: z.enum(SELECTABLE_HISTORY_FIELD).describe(
      "sort by selected row, select just only one",
    ),
    limit: z.number().optional().describe("result max number"),
    asc: z.boolean().optional().describe("sort order ascending"),
    distinct: z.boolean().optional().describe("Do not show duplicate results"),
  }),
  execute: async (params) => {
    // URL構築
    const url = new URL(`${APIV1}/filter/history`);
    // 検索キーワード
    if (params.製番) url.searchParams.set("製番", params.製番);
    if (params.工事名称) url.searchParams.set("工事名称", params.工事名称);
    if (params.品番) url.searchParams.set("品番", params.品番);
    if (params.品名) url.searchParams.set("品名", params.品名);
    if (params.型式) url.searchParams.set("型式", params.型式);
    // 表示列
    SELECTABLE_HISTORY_FIELD.forEach((field) => {
      if (params.select.includes(field)) { // paramsにあれば適宜追加
        url.searchParams.append("select", field);
      }
    });
    url.searchParams.set("select", "製番");
    url.searchParams.append("select", "品番");
    url.searchParams.append("select", "品名");
    url.searchParams.append("select", "型式");
    url.searchParams.append("select", "手配数量");
    url.searchParams.append("select", "単位");
    url.searchParams.append("select", "発注納期");
    // ソート列
    url.searchParams.set("orderby", params.orderby ?? "製番"); // orderby は必須
    url.searchParams.set("limit", String(params.limit ?? DEFAULT_LIMIT));
    url.searchParams.set("asc", String(params.asc ?? DEFAULT_ASC));
    // 重複非表示(デフォルトはすべて表示)
    url.searchParams.set(
      "distinct",
      String(params.distinct ?? DEFAULT_DISTINCT),
    );
    console.error("URL:", url);

    // fetchした結果をコーディングエージェントに返す
    const json = await fetchPNSearch(url, { timeout: 100000, retries: 3 });
    return JSON.stringify(json, null, 2);
  },
});

// MAIN
server.start({ transportType: "stdio" });
console.error("MCP server running on stdio");
