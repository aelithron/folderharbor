package cmd
import (
	"github.com/spf13/cobra"
	"fmt"
	"os"
)

var rootCMD = &cobra.Command{
	Use: "folderharbor",
	Short: "a cli for interacting with folderharbor servers",
	Long: "a powerful cli for file management and admin actions, used with folderharbor servers",
}
func Execute() {
	if err := rootCMD.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "An error occurred running FolderHarbor CLI - '%s'\n", err)
		os.Exit(1)
	}
}