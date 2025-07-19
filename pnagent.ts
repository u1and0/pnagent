/** MCPサーバーの立ち上げ
 * Toolの定義をserver.addTool()によって列挙する
 */
import { FastMCP } from "npm:fastmcp@1.20.5";
import {
  HistorySearchTool,
  ProjectSearchTool,
  StockSearchTool,
} from "./core/tools.ts";

const server = new FastMCP({
  name: "PNAgent",
  version: "0.2.0",
});

// Tools
const stockSearchTool = new StockSearchTool();
const historySearchTool = new HistorySearchTool();
const projectSearchTool = new ProjectSearchTool();

server.addTool(stockSearchTool);
server.addTool(historySearchTool);
server.addTool(projectSearchTool);

// MAIN
server.start({ transportType: "stdio" });
console.error("MCP server running on stdio");
