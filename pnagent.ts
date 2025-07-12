/* FastMCPでURL, JSON系の操作
 *
 * [ 注意 ] deno check すると肘王に動作が重たい。メモリ不足によりクラッシュすることがあるため
 * deno run , deno test では --no-checkフラグが必要
 *
 * [ 注意 ] FastMCP使うときは deno run -A しないといけない。
 * --deny-envなどでenvを拒否するとツールを読み込んでくれない。
 */

import { FastMCP } from "npm:fastmcp@1.20.5";
import { z } from "npm:zod@3.24.2";

const server = new FastMCP({
  name: "Search PNSearch for parts information",
  version: "0.1.0",
});

// const BASEURL = "http://localhost:8080/api/v1";
const BASEURL = "http://192.168.10.110:9000/api/v1";

async function fetchPNSearch(url: URL): Promise<{ url: string; result: any }> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        url: decodeURIComponent(url.toString()),
        result: "Failed to fetch: status" +
          `${response.status}, ${await response.text()}`,
      };
    }
    console.error("fetch success");
    const responseText = await response.text();
    try {
      const jsonResult = JSON.parse(responseText);
      return {
        url: decodeURIComponent(url.toString()),
        result: jsonResult, // Return the parsed JSON object
      };
    } catch (jsonError) {
      console.error("Failed to parse response as JSON:", jsonError);
      return {
        url: decodeURIComponent(url.toString()),
        result: responseText, // Fallback to raw text if not JSON
      };
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      url: decodeURIComponent(url.toString()),
      result: `Fetch error: ${error}`,
    };
  }
}

// 在庫検索
server.addTool({
  name: "Stock Search",
  description: "ユーザーの入力を部品在庫検索用URLに変換して結果を返す",
  parameters: z.object({
    品番: z.string().optional().describe("parts ID"),
    品名: z.string().optional().describe("parts name, Japanese name"),
    型式: z.string().optional().describe(
      "parts model name, alphabet or number",
    ),
    orderby: z.string().optional().describe("sort by selected row"),
    limit: z.number().optional().describe("result max number"),
    asc: z.boolean().optional().describe("sort order ascending"),
  }),
  execute: async (params) => {
    // URL構築
    const url = new URL(`${BASEURL}/filter/stock`);
    // 検索キーワード
    if (params.品番) url.searchParams.set("品番", params.品番);
    if (params.品名) url.searchParams.set("品名", params.品名);
    if (params.型式) url.searchParams.set("型式", params.型式);
    // 表示列
    url.searchParams.set("select", "品番");
    url.searchParams.append("select", "品名");
    url.searchParams.append("select", "型式");
    url.searchParams.append("select", "在庫数");
    url.searchParams.append("select", "単位");
    // ソート列
    url.searchParams.set("orderby", params.orderby ?? "品番"); // orderby は必須
    if (params.limit) {
      url.searchParams.set("limit", params.limit.toString() ?? "100");
    }
    if (params.asc) {
      url.searchParams.set("asc", params.asc.toString() ?? "false");
    }
    console.error("URL:", url);
    // fetchした結果を返す
    const json = await fetchPNSearch(url);
    return JSON.stringify(json);
  },
});

// 発注検索
server.addTool({
  name: "History Search",
  description: "ユーザーの入力を部品発注履歴検索用URLに変換して結果を返す",
  parameters: z.object({
    製番: z.string().optional().describe("project ID"),
    製番名称: z.string().optional().describe("project name"),
    品番: z.string().optional().describe("parts ID"),
    品名: z.string().optional().describe("parts name, Japanese name"),
    型式: z.string().optional().describe(
      "parts model name, alphabet or number",
    ),
    orderby: z.string().describe("sort by selected row"),
    limit: z.number().optional().describe("result max number"),
    asc: z.boolean().optional().describe("sort order ascending"),
  }),
  execute: async (params) => {
    // URL構築
    const url = new URL(`${BASEURL}/filter/history`);
    // 検索キーワード
    if (params.製番) url.searchParams.set("製番", params.製番);
    if (params.製番名称) url.searchParams.set("製番名称", params.製番名称);
    if (params.品番) url.searchParams.set("品番", params.品番);
    if (params.品名) url.searchParams.set("品名", params.品名);
    if (params.型式) url.searchParams.set("型式", params.型式);
    // 表示列
    url.searchParams.set("select", "製番");
    url.searchParams.append("select", "品番");
    url.searchParams.append("select", "品名");
    url.searchParams.append("select", "型式");
    url.searchParams.append("select", "手配数量");
    url.searchParams.append("select", "単位");
    url.searchParams.append("select", "発注納期");
    // ソート列
    url.searchParams.set("orderby", params.orderby ?? "製番"); // orderby は必須
    url.searchParams.set("limit", params.limit.toString() ?? "50");
    url.searchParams.set("asc", params.asc.toString() ?? "false");
    console.error("URL:", url);
    // return JSON.stringify({ result: result.toString() });

    // fetchした結果を返す
    const json = await fetchPNSearch(url);
    return JSON.stringify(json);
  },
});
// MAIN
server.start({ transportType: "stdio" });
// console.error("MCP server running on stdio");
