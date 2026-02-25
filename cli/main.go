package main

import (
	"errors"
	"folderharbor-cli/cmd"

	"github.com/spf13/viper"
)

func main() {
	viper.SetConfigName("config")
	viper.AddConfigPath("$HOME/.folderharbor")
	var fileLookupErr viper.ConfigFileNotFoundError
	if err := viper.ReadInConfig(); err != nil {
		if errors.As(err, &fileLookupErr) {
			viper.SafeWriteConfig()
		} else { panic(err) }
	}
	cmd.Execute()
}