package imagetool

import (
	"bytes"
	"fmt"
	"image"
	"image/gif"
	"image/jpeg"
	"image/png"
	"mime/multipart"

	"github.com/chai2010/webp"
)

const (
	MaxAvatarWidth  = 400 // 最大宽度
	MaxAvatarHeight = 400 // 最大高度
	WebPQuality     = 90  // WebP 质量 (0-100)
)

func CompressImageToWebP(src multipart.File, contentType string) ([]byte, error) {
	var img image.Image
	var err error

	src.Seek(0, 0)

	switch contentType {
	case "image/jpeg":
		img, err = jpeg.Decode(src)
	case "image/png":
		img, err = png.Decode(src)
	case "image/gif":
		img, err = gif.Decode(src)
	default:
		src.Seek(0, 0)
		img, _, err = image.Decode(src)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	// 调整图片大小
	resizedImg := ResizeImage(img, MaxAvatarWidth, MaxAvatarHeight)

	var buf bytes.Buffer
	if err := webp.Encode(&buf, resizedImg, &webp.Options{Quality: WebPQuality}); err != nil {
		return nil, fmt.Errorf("failed to encode webp: %w", err)
	}

	return buf.Bytes(), nil
}
