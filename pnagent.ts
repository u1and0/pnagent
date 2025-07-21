/** MCPサーバーの立ち上げ
 * Toolの定義をserver.addTool()によって列挙する
 */
import { FastMCP } from "npm:fastmcp@1.20.5";
import {
  HistorySearchTool,
  PartsMasterSearchTool,
  ProjectSearchTool,
  RequestTool,
  StockSearchTool,
} from "./core/tools.ts";

const server = new FastMCP({
  name: "PNAgent",
  version: "0.4.0",
});

// Tools
const stockSearchTool = new StockSearchTool();
const historySearchTool = new HistorySearchTool();
const projectSearchTool = new ProjectSearchTool();
const partsMasterSearchTool = new PartsMasterSearchTool();
const requestTool = new RequestTool();

server.addTool(stockSearchTool);
server.addTool(historySearchTool);
server.addTool(projectSearchTool);
server.addTool(partsMasterSearchTool);
server.addTool(requestTool);

// MAIN
server.start({ transportType: "stdio" });
console.error("MCP server running on stdio");
