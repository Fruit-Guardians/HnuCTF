package emailjwt

import (
	"a1ctf/src/utils/general"
	redistool "a1ctf/src/utils/redis_tool"
	"crypto/rsa"
	"errors"
	"os"
	"time"

	"github.com/bytedance/sonic"
	jwt_v5 "github.com/golang-jwt/jwt/v5"
)

var (
	privateKey *rsa.PrivateKey
	publicKey  *rsa.PublicKey
)

var privKeyFile = "./data/rsa_private_key.pem"
var pubKeyFile = "./data/rsa_public_key.pem"

func InitRSAKeys() {
	tmp1, err := os.ReadFile(privKeyFile)
	if err == nil {
		key, _ := jwt_v5.ParseRSAPrivateKeyFromPEM(tmp1)
		privateKey = key
	} else {
		panic(err)
	}

	tmp2, err := os.ReadFile(pubKeyFile)
	if err == nil {
		key, _ := jwt_v5.ParseRSAPublicKeyFromPEM(tmp2)
		publicKey = key
	} else {
		panic(err)
	}
}

type EmailVerificationClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Usage  string `json:"usage"`
	// jwt_v5.RegisteredClaims
}

func GenerateEmailVerificationTokens(UserID string, Email string, Usage string) (string, error) {
	claims := EmailVerificationClaims{
		UserID: UserID,
		Email:  Email,
		Usage:  Usage,
		// RegisteredClaims: jwt_v5.RegisteredClaims{
		// 	ExpiresAt: jwt_v5.NewNumericDate(time.Now().Add(30 * time.Minute)),
		// 	IssuedAt:  jwt_v5.NewNumericDate(time.Now()),
		// 	NotBefore: jwt_v5.NewNumericDate(time.Now()),
		// 	Issuer:    "email-verification",
		// },
	}

	// token := jwt_v5.NewWithClaims(jwt_v5.SigningMethodRS384, claims)
	// tokenString, err := token.SignedString(privateKey)
	// return tokenString, err

	dataText, err := sonic.MarshalString(claims)
	if err != nil {
		return "", err
	}

	keyName := general.RandomStringLower(64)
	seted := redistool.SetValueForATime(keyName, dataText, 30*time.Minute)

	if !seted {
		return "", errors.New("set value for time failed")
	}

	return keyName, nil
}

func GetEmailVerificationClaims(tokenString string) (*EmailVerificationClaims, error) {
	// token, err := jwt_v5.ParseWithClaims(tokenString, &EmailVerificationClaims{}, func(token *jwt_v5.Token) (interface{}, error) {
	// 	return publicKey, nil
	// })
	// if err != nil {
	// 	return nil, err
	// }
	// return token.Claims.(*EmailVerificationClaims), nil

	dataText, err := redistool.GetValue(tokenString)
	if err != nil {
		return nil, err
	}

	err = redistool.UnsetValue(tokenString)
	if err != nil {
		return nil, err
	}

	var claims EmailVerificationClaims
	err = sonic.UnmarshalString(dataText, &claims)
	if err != nil {
		return nil, err
	}

	return &claims, nil
}
