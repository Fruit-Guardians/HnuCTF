package utils

import (
	"bytes"
	"log"
	"os"

	"github.com/spf13/viper"
)

func LoadConfig() {
	data, err := os.ReadFile("config.yaml")
	if err != nil {
		log.Fatalf("Failed to read config file: %v", err)
	}
	viper.SetConfigType("yaml")
	if err := viper.ReadConfig(bytes.NewBuffer(data)); err != nil {
		log.Fatalf("Failed to parse config file: %v", err)
	}
}
