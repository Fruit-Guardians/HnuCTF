import { motion } from 'framer-motion'

interface SkyBackgroundProps {
    theme: string
}

const SkyBackground: React.FC<SkyBackgroundProps> = ({ theme }) => {
    return (
        <motion.div 
            // key={theme}
            // className={`absolute inset-0 overflow-hidden ${theme === 'dark'
            //     ? 'bg-gradient-to-b from-blue-800 to-[#0D1231]'
            //     : 'bg-gradient-to-b from-blue-200 to-blue-400'
            // }`}
            // initial={{ opacity: 0, scale: 1 }} // 初始状态
            // animate={{ opacity: 1, scale: 1 }} // 动画目标状态
            // exit={{ opacity: 0, scale: 1.05 }} // 退出状态
            // transition={{ duration: 0.4, ease: "easeInOut" }} // 动画持续时间和缓动函数
                className="absolute inset-0 overflow-hidden"
                animate={{
                    background: theme === "dark"
                        ? "linear-gradient(to bottom, #1E3A8A, #0D1231)" // 深色模式背景渐变
                        : "linear-gradient(to bottom, #BFDBFE, #93C5FD)", // 浅色模式背景渐变
                }}
                initial={false} // 直接从当前状态开始
                transition={{
                    duration: 0.8, // 渐变动画持续时间
                    ease: "easeInOut", // 使用平滑缓动
                }}
            >
            {theme === 'dark' ? (
                // 星空背景
                Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            x: Math.random() * 100 - 50,
                            y: Math.random() * 60 - 30,
                        }}
                        transition={{
                            duration: Math.random() * 2 + 1,
                            repeat: Infinity,
                            repeatType: 'loop',
                            ease: 'easeInOut',
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))
            ) : (
                // 云朵背景
                Array.from({ length: 3 + Math.random() * 4 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute opacity-80"
                        initial={{ x: Math.random() * 10 + Math.random() * 20 + Math.random() * 20 + 10 }}
                        animate={{ x: 120 }}
                        transition={{
                            duration: Math.random() * 1 + 16, // 每个云朵的动画时间随机
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'linear',
                        }}
                        style={{
                            top: `${Math.random() * 80}%`, // 随机高度
                        }}
                    >
                        {/* 使用你的 SVG 形状 */}
                        <svg
                            version="1.0"
                            xmlns="http://www.w3.org/2000/svg"
                            width={`${Math.random() * 40 + 30}`} // 随机云朵宽度
                            height={`${Math.random() * 20 + 15}`} // 随机云朵高度
                            viewBox="0 0 1280.000000 822.000000"
                            preserveAspectRatio="xMidYMid meet"
                        >
                            <g
                                transform="translate(0.000000,822.000000) scale(0.100000,-0.100000)"
                                fill="#ffffff" // 云朵填充颜色为白色
                                stroke="none"
                            >
                                <path
                                    d="M7121 8205 c-484 -56 -926 -221 -1315 -494 -238 -166 -476 -397 -637
                                    -618 -23 -32 -44 -60 -45 -62 -2 -2 -40 8 -84 23 -117 38 -260 73 -385 92
                                    -150 23 -442 23 -590 0 -611 -94 -1127 -423 -1468 -934 -235 -353 -362 -809
                                    -344 -1229 l6 -132 -32 -5 c-18 -3 -72 -10 -122 -16 -413 -50 -861 -242 -1201
                                    -515 -434 -349 -738 -846 -852 -1395 -38 -183 -47 -272 -46 -495 0 -243 14
                                    -368 63 -571 221 -899 936 -1599 1835 -1794 268 -58 -2 -55 4336 -55 3806 0
                                    4011 1 4125 18 649 97 1197 373 1635 824 142 145 217 237 324 396 233 346 381
                                    728 448 1162 18 116 22 183 22 395 0 282 -16 420 -74 657 -180 738 -643 1363
                                    -1298 1752 -333 198 -715 326 -1104 371 -117 14 -118 14 -118 89 0 95 -59 403
                                    -107 556 -75 243 -205 524 -331 715 -452 687 -1140 1129 -1947 1250 -185 28
                                    -520 35 -694 15z"
                                />
                            </g>
                        </svg>
                    </motion.div>
                ))
            )}
        </motion.div>
    )
}

export default SkyBackground
