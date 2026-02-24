package main

import (
	"errors"
	"fmt"
	"folderharbor-cli/cmd"
	"os"

	"github.com/spf13/viper"
)

func main() {
	viper.SetConfigName("config")
	viper.AddConfigPath("$HOME/.folderharbor")
	viper.AddConfigPath(".")
	var fileLookupErr viper.ConfigFileNotFoundError
	if err := viper.ReadInConfig(); err != nil {
		if errors.As(err, &fileLookupErr) {
			fmt.Println("Error finding your config file!")
			os.Exit(1);
		} else { panic(err) }
	}
	cmd.Execute()
}
