package cmd
import "github.com/spf13/cobra"

var configCMD = &cobra.Command{
	Use:   "config",
	Short: "(admin) manage the config",
	Long:  "(admin) manage the configuration of a folderharbor server",
}
var readConfigCMD = &cobra.Command{
	Use:   "read",
	Short: "read the config",
	Long:  "read the server configuration",
	Aliases: []string{"get"},
	Run: func(cmd *cobra.Command, args []string) {
		
	},
}
var editConfigCMD = &cobra.Command{
	Use:   "edit <key> <value>",
	Short: "edit the config",
	Long:  "modify the server configuration",
	Run: func(cmd *cobra.Command, args []string) {
		
	},
}

func main() {
	rootCMD.AddCommand(configCMD)
	configCMD.AddCommand(readConfigCMD)
	configCMD.AddCommand(editConfigCMD)
}