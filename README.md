MCP Server for PNSearch

PNSearchの検索結果を基にエージェントが回答してくれるようにするため、
エージェントにPNSearchを使ってもらうようにするMCPサーバーをセットアップします。

## Setting

1. 事前にPNSearchサーバーを立てておく必要があります。

```
$ pnsearch -p 9000
```

2. コーディングアシスタント(gemini-cli, claude-code, ROO, Cursorなど)を使用できるようにしておく必要があります。

3. コーディングアシスタントの設定でMCPサーバーとしてpnagentが使用できるようにしておく必要があります。

```json:.gemini/settings.json
{
  "mcpServers": {
    "pnagent": {
      "command": "deno",
      "args": ["run",  "-A",  "./pnagent.ts"]
    }
  }
}
```

## Usage

```
$ gemini
╭─────────────────────────────────────────╮
│  > 品番AAA-100の在庫数を調べてください  │
╰─────────────────────────────────────────╯

 ╭──────────────────────────────────────────────────────────────────────────────────────────────────────────╮
 │ ✔  PNSearch Stock search (pnagent MCP Server) {"品番":"AAA-100"}                                         │
 │                                                                                                          │
 │    {"url":"http://192.168.10.110:9000/api/v1/filter/stock?品番=AAA-100&select=品番&select=品名&select=   │
 │    型式&select=在庫数&select=単位&orderby=品番","result":[{"品番":"AAA-100","品名":"Some Parts Name"     │
 ╰──────────────────────────────────────────────────────────────────────────────────────────────────────────╯

 ✦ 品番AAA-100の在庫数は4です。
```
