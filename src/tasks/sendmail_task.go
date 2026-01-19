package tasks

import (
	"a1ctf/src/db/models"
	clientconfig "a1ctf/src/modules/client_config"
	emailjwt "a1ctf/src/modules/jwt_email"
	"a1ctf/src/utils/zaphelper"
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/hibiken/asynq"
	"github.com/spf13/viper"
	"github.com/vmihailenco/msgpack/v5"
	"go.uber.org/zap"
	"gopkg.in/mail.v2"
)

type MailTaskType string

const (
	MailTaskTypeEmailVerification MailTaskType = "emailVerification"
	MailTaskTypeSendTestMail      MailTaskType = "emailSendTestMail"
	MailTaskTypeForgetPassword    MailTaskType = "forgetPasswordEmail"
)

type EmailVerificationData struct {
	User models.User
}

type SendMailTaskPayload struct {
	MailSendType          MailTaskType
	EmailVerificationData *EmailVerificationData
	SendTestMailTo        *string
	TestMailType          *string
}

func checkEmailConfig() error {
	// 配置为空
	if clientconfig.ClientConfig.SmtpHost == "" || clientconfig.ClientConfig.SmtpUsername == "" || clientconfig.ClientConfig.SmtpPassword == "" || clientconfig.ClientConfig.SmtpFrom == "" {
		return fmt.Errorf("SmtpConfigEmpty")
	}
	// 配置错误
	if clientconfig.ClientConfig.SmtpPort < 1 || clientconfig.ClientConfig.SmtpPort > 65535 {
		return fmt.Errorf("SmtpConfigError")
	}
	return nil
}

func NewEmailVerificationTask(user models.User) error {
	if err := checkEmailConfig(); err != nil {
		return err
	}

	payload, err := msgpack.Marshal(SendMailTaskPayload{
		MailSendType:          MailTaskTypeEmailVerification,
		EmailVerificationData: &EmailVerificationData{User: user},
	})

	if err != nil {
		return err
	}

	task := asynq.NewTask(TypeSendMail, payload)
	// taskID 是为了防止重复创建任务
	_, err = client.Enqueue(task,
		asynq.MaxRetry(3),
		asynq.Timeout(10*time.Second),
	)

	return err
}

func NewForgePasswordEmailTask(user models.User) error {
	if err := checkEmailConfig(); err != nil {
		return err
	}

	payload, err := msgpack.Marshal(SendMailTaskPayload{
		MailSendType:          MailTaskTypeForgetPassword,
		EmailVerificationData: &EmailVerificationData{User: user},
	})

	if err != nil {
		return err
	}

	task := asynq.NewTask(TypeSendMail, payload)
	// taskID 是为了防止重复创建任务
	_, err = client.Enqueue(task,
		asynq.MaxRetry(3),
		asynq.Timeout(10*time.Second),
	)

	return err
}

func NewSendTestMailTask(to string, mailType string) error {
	if err := checkEmailConfig(); err != nil {
		return err
	}

	payload, err := msgpack.Marshal(SendMailTaskPayload{
		MailSendType:   MailTaskTypeSendTestMail,
		SendTestMailTo: &to,
		TestMailType:   &mailType,
	})

	if err != nil {
		return err
	}

	task := asynq.NewTask(TypeSendMail, payload)
	// taskID 是为了防止重复创建任务
	_, err = client.Enqueue(task,
		asynq.MaxRetry(3),
		asynq.Timeout(10*time.Second),
	)

	return err
}

func HandleSendMailTask(ctx context.Context, t *asynq.Task) error {
	var p SendMailTaskPayload
	if err := msgpack.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("json.Unmarshal failed: %v: %w", err, asynq.SkipRetry)
	}

	zaphelper.Logger.Info("sendmail start", zap.Any("mail_data", p))

	m := mail.NewMessage()
	m.SetAddressHeader("From", clientconfig.ClientConfig.SmtpFrom, clientconfig.ClientConfig.SmtpName)

	switch p.MailSendType {
	case MailTaskTypeEmailVerification:
		receiver := p.EmailVerificationData.User

		// 先生成验证码
		token, err := emailjwt.GenerateEmailVerificationTokens(receiver.UserID, *receiver.Email, "email-verify")

		if err != nil {
			zaphelper.Logger.Error("sendmail failed", zap.Any("mail_data", p), zap.Error(err))
			return fmt.Errorf("generate mail token failed: %v: %w", err, asynq.SkipRetry)
		}
		m.SetAddressHeader("To", *receiver.Email, receiver.Username)

		emailHeader := clientconfig.ClientConfig.VerifyEmailHeader
		emailHeader = strings.ReplaceAll(emailHeader, "{username}", receiver.Username)

		m.SetHeader("Subject", emailHeader)

		mailTeamplate := clientconfig.ClientConfig.VerifyEmailTemplate

		verification_url := fmt.Sprintf("%s/email-verify?code=%s", viper.GetString("system.baseURL"), token)

		mailTeamplate = strings.ReplaceAll(mailTeamplate, "{username}", receiver.Username)
		mailTeamplate = strings.ReplaceAll(mailTeamplate, "{verification_link}", verification_url)

		m.SetBody("text/html", mailTeamplate)
	case MailTaskTypeForgetPassword:
		receiver := p.EmailVerificationData.User

		// 先生成验证码
		token, err := emailjwt.GenerateEmailVerificationTokens(receiver.UserID, *receiver.Email, "reset-password")

		if err != nil {
			zaphelper.Logger.Error("sendmail failed", zap.Any("mail_data", p), zap.Error(err))
			return fmt.Errorf("generate mail token failed: %v: %w", err, asynq.SkipRetry)
		}
		m.SetAddressHeader("To", *receiver.Email, receiver.Username)

		emailHeader := clientconfig.ClientConfig.ForgetPasswordHeader
		emailHeader = strings.ReplaceAll(emailHeader, "{username}", receiver.Username)

		m.SetHeader("Subject", emailHeader)

		mailTeamplate := clientconfig.ClientConfig.ForgetPasswordTemplate

		reset_url := fmt.Sprintf("%s/reset-password?code=%s", viper.GetString("system.baseURL"), token)

		mailTeamplate = strings.ReplaceAll(mailTeamplate, "{username}", receiver.Username)
		mailTeamplate = strings.ReplaceAll(mailTeamplate, "{reset_link}", reset_url)

		m.SetBody("text/html", mailTeamplate)
	case MailTaskTypeSendTestMail:
		m.SetAddressHeader("To", *p.SendTestMailTo, "EMMMMMMMMM")

		switch *p.TestMailType {
		case "verify":
			m.SetHeader("Subject", clientconfig.ClientConfig.VerifyEmailHeader)
			m.SetBody("text/html", clientconfig.ClientConfig.VerifyEmailTemplate)
		case "forget":
			m.SetHeader("Subject", clientconfig.ClientConfig.ForgetPasswordHeader)
			m.SetBody("text/html", clientconfig.ClientConfig.ForgetPasswordTemplate)
		default:
			m.SetHeader("Subject", "这是一封测试邮件")
			m.SetBody("text/html", "这是一封测试邮件")
		}
	}

	d := mail.NewDialer(clientconfig.ClientConfig.SmtpHost, clientconfig.ClientConfig.SmtpPort, clientconfig.ClientConfig.SmtpUsername, clientconfig.ClientConfig.SmtpPassword)

	if clientconfig.ClientConfig.SmtpPortType == "starttls" {
		d.StartTLSPolicy = mail.MandatoryStartTLS
	}

	if clientconfig.ClientConfig.SmtpPortType == "tls" {
		d.SSL = true
	}

	if err := d.DialAndSend(m); err != nil {
		zaphelper.Logger.Error("sendmail failed", zap.Any("mail_data", p), zap.Error(err))
		return fmt.Errorf("send mail failed %w", err)
	}

	zaphelper.Logger.Info("sendmail success", zap.Any("mail_data", p))

	return nil
}
