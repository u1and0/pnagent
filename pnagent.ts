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

server.addTool({
  name: "PNSearch Parts ID search",
  description: "ユーザーの入力を部品検索用URLに変換して結果を返す",
  parameters: z.object({
    品番: z.string().optional().describe("parts ID"),
    品名: z.string().optional(),
    型式: z.string().optional(),
    limit: z.number().optional(),
    ask: z.boolean().optional(),
  }),
  execute: async (params) => {
    // URL構築
    const url = new URL(`${BASEURL}/filter/pid`);
    // 検索キーワード
    if (params.品番) url.searchParams.set("品番", params.品番);
    if (params.品名) url.searchParams.set("品名", params.品名);
    if (params.型式) url.searchParams.set("型式", params.型式);
    // 表示列
    url.searchParams.set("select", "品番");
    url.searchParams.append("select", "品名");
    url.searchParams.append("select", "型式");
    url.searchParams.append("select", "単位");
    // ソート列
    url.searchParams.set("orderby", "品番");
    if (params.limit) {
      url.searchParams.set("limit", params.limit.toString() ?? "100");
    }
    if (params.ask) {
      url.searchParams.set("ask", params.ask.toString() ?? "false");
    }
    console.error("URL:", url);
    // return JSON.stringify({ result: result.toString() });

    // fetchした結果を返す
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return JSON.stringify({
          url: decodeURIComponent(url.toString()),
          result: "Failed to fetch: status" +
            `${response.status}, ${await response.text()}`,
        });
      }
      console.error("fetch success");
      const responseText = await response.text();
      try {
        const jsonResult = JSON.parse(responseText);
        return JSON.stringify({
          url: decodeURIComponent(url.toString()),
          result: jsonResult, // Return the parsed JSON object
        });
      } catch (jsonError) {
        console.error("Failed to parse response as JSON:", jsonError);
        return JSON.stringify({
          url: decodeURIComponent(url.toString()),
          result: responseText, // Fallback to raw text if not JSON
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      return JSON.stringify({
        url: decodeURIComponent(url.toString()),
        result: `Fetch error: ${error}`,
      });
    }
  },
});

// MAIN
server.start({ transportType: "stdio" });
// console.error("MCP server running on stdio");
