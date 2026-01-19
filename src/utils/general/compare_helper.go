package general

func CompareStringPtrEquals(a, b *string) bool {
	// 如果两个指针都指向 nil，则认为相等
	if a == nil && b == nil {
		return true
	}
	// 如果只有一个指针是 nil，则不相等
	if a == nil || b == nil {
		return false
	}
	// 比较指针指向的实际字符串值
	return *a == *b
}
