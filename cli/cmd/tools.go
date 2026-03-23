package cmd

import (
	"encoding/json"
	"fmt"
	"folderharbor-cli/routes"
	"strconv"
	"time"

	"github.com/spf13/cobra"
)

var toolsCMD = &cobra.Command{
	Use:   "tools",
	Aliases: []string{"utils"},
	Short: "some extra tools",
	Long:  "extra tools for folderharbor",
}
var readLogsCMD = &cobra.Command{
	Use: "logs [page]",
	Short: "(admin) read the audit log",
	Long: "(admin) read the server's audit log",
	Args: cobra.RangeArgs(0, 1),
	Run: func(cmd *cobra.Command, args []string) {
		var page = 1
		if len(args) == 1 {
			pageArg, err := strconv.Atoi(args[0])
			if err != nil { panic (err) }
			page = pageArg
		}
		var logs routes.AuditLog
		logs = routes.ReadLogs(page)
		if page > logs.PageCount { 
			page = logs.PageCount
			logs = routes.ReadLogs(page)
		}
		fmt.Println("Audit Logs (Page " + fmt.Sprint(page) + "/" + fmt.Sprint(logs.PageCount) + ")")
		fmt.Println("----------------------------")
    if len(logs.Logs) == 0 { fmt.Println("No logs on this page!") }
	  for log := range logs.Logs { fmt.Println(logFormatter(logs.Logs[log])) }
	},
}
func init() {
	rootCMD.AddCommand(toolsCMD)
	toolsCMD.AddCommand(readLogsCMD)
}
func logFormatter(log routes.LogEntry) (string) {
	if log.Username == "" { log.Username = "Unknown User" }
	createdAtRaw, err := time.Parse(time.RFC3339, log.CreatedAt)
	var createdAt string
	if err == nil {
		createdAt = createdAtRaw.Format(time.RFC1123)
	} else {
		createdAt = log.CreatedAt
	}
	var data map[string]any
	if err := json.Unmarshal(log.Body, &data); err != nil { panic (err) }
  var line1 = "• " + log.Username + " (ID #" + fmt.Sprint(log.UserID) + ") " + log.Blurb + " on " + createdAt + " (action: " + log.Action + ")"
	return line1 + "\n  " + fmt.Sprint(data)
}