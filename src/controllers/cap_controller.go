package controllers

import (
	proofofwork "a1ctf/src/modules/proof_of_work"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CapCreateChallenge(ginCtx *gin.Context) {
	c := proofofwork.CapInstance

	if c.Limiter[0] != nil && !c.Limiter[0].Allow() {
		ginCtx.JSON(http.StatusTooManyRequests, gin.H{"error": "Too Many Requests"})
		return
	}

	challenge, err := c.CreateChallenge(ginCtx.Request.Context())
	if err != nil {
		ginCtx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ginCtx.JSON(http.StatusOK, challenge)
}

func CapRedeemChallenge(ginCtx *gin.Context) {
	c := proofofwork.CapInstance

	if c.Limiter[1] != nil && !c.Limiter[1].Allow() {
		ginCtx.JSON(http.StatusTooManyRequests, gin.H{"error": "Too Many Requests"})
		return
	}

	var params proofofwork.VerificationParams
	if err := ginCtx.ShouldBindJSON(&params); err != nil {
		ginCtx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var resp proofofwork.VerificationResult
	result, err := c.RedeemChallenge(ginCtx.Request.Context(), params.Token, params.Solutions)
	if err != nil {
		resp.Message = err.Error()
	} else {
		resp.Success = true
		resp.TokenData = result
	}
	ginCtx.JSON(http.StatusOK, resp)
}

func CapValidateToken(ginCtx *gin.Context) {
	c := proofofwork.CapInstance

	if c.Limiter[2] != nil && !c.Limiter[2].Allow() {
		ginCtx.JSON(http.StatusTooManyRequests, gin.H{"error": "Too Many Requests"})
		return
	}

	var params proofofwork.VerificationParams
	if err := ginCtx.ShouldBindJSON(&params); err != nil {
		ginCtx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ginCtx.JSON(http.StatusOK, proofofwork.VerificationResult{
		Success: c.ValidateToken(ginCtx.Request.Context(), params.Token),
	})
}
