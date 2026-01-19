package general

import (
	"crypto/rand"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"math/big"
)

func Sha512Hash(text string) string {
	hasher := sha512.New()
	hasher.Write([]byte(text))
	return hex.EncodeToString(hasher.Sum(nil))
}

func SaltPassword(password, salt string) string {
	buf := fmt.Sprintf("$%s$%s", Sha512Hash(password), salt)
	return Sha512Hash(buf)
}

func RandomString(length int) string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
		"abcdefghijklmnopqrstuvwxyz" +
		"0123456789"

	result := make([]byte, length)
	for i := range result {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			panic(err)
		}
		result[i] = charset[num.Int64()]
	}
	return string(result)
}

func RandomStringLower(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyz" +
		"0123456789"

	result := make([]byte, length)
	for i := range result {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			panic(err) // 在实际应用中应该处理这个错误
		}
		result[i] = charset[num.Int64()]
	}
	return string(result)
}

func RandomPassword(length int) string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
		"abcdefghijklmnopqrstuvwxyz" +
		"0123456789" +
		"!@#$%&"

	result := make([]byte, length)
	for i := range result {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			panic(err)
		}
		result[i] = charset[num.Int64()]
	}
	return string(result)
}

func RandomHash(length int) string {
	const charset = "abcdef" +
		"0123456789"

	result := make([]byte, length)
	for i := range result {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			panic(err) // 在实际应用中应该处理这个错误
		}
		result[i] = charset[num.Int64()]
	}
	return string(result)
}

func GenerateSalt() string {
	return RandomString(48)
}
