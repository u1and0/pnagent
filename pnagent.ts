import { FastMCP } from "npm:fastmcp@1.20.5";
import { HistorySearchTool, StockSearchTool } from "./core/tools.ts";
import { fetchPNSearch } from "./core/fetcher.ts";

// fetchPNSearchをbaseTool.tsから使えるようにエクスポートしておく
// baseToolで循環参照が起きないようにするため
export { fetchPNSearch };

const server = new FastMCP({
  name: "PNAgent",
  version: "0.1.1",
});

// Tools
const stockSearchTool = new StockSearchTool();
const historySearchTool = new HistorySearchTool();

server.addTool(stockSearchTool);
server.addTool(historySearchTool);

// MAIN
server.start({ transportType: "stdio" });
console.error("MCP server running on stdio");
