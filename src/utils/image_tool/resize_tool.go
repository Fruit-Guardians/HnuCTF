package imagetool

import (
	"image"

	"github.com/nfnt/resize"
)

func ResizeImage(img image.Image, maxWidth, maxHeight int) image.Image {
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	if width <= maxWidth && height <= maxHeight {
		return img
	}

	// 计算缩放比例
	widthRatio := float64(maxWidth) / float64(width)
	heightRatio := float64(maxHeight) / float64(height)

	var ratio float64
	if widthRatio < heightRatio {
		ratio = widthRatio
	} else {
		ratio = heightRatio
	}

	newWidth := uint(float64(width) * ratio)
	newHeight := uint(float64(height) * ratio)

	// Lanczos
	return resize.Resize(newWidth, newHeight, img, resize.Lanczos3)
}
