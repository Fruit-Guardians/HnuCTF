import React, { useRef, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ECharts, EChartsOption } from 'echarts';
import dayjs from 'dayjs';
import { useGlobalVariableContext } from 'contexts/GlobalVariableContext';
import { UserFullGameInfo } from 'utils/A1API';
import { Maximize2, Minimize2, Move, X, Minus, Download } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';

interface SmartUpdateChartProps {
    theme?: 'light' | 'dark';
    gameInfo: UserFullGameInfo | undefined;
    isFullscreen?: boolean;
    isFloating?: boolean;
    onToggleFullscreen?: () => void;
    onToggleFloating?: () => void;
    onMinimize?: () => void;
}

const BetterChart: React.FC<SmartUpdateChartProps> = ({
    theme = 'light',
    gameInfo,
    isFullscreen,
    isFloating,
    onToggleFullscreen,
    onToggleFloating,
    onMinimize,
}) => {
    const chartRef = useRef<ReactECharts>(null);
    const serData = React.useRef<echarts.SeriesOption[]>([])
    const lastSerData = useRef<string>("")
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: 500, height: 350 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeType, setResizeType] = useState('');
    const [resizeStart, setResizeStart] = useState({ size: { width: 0, height: 0 }, position: { x: 0, y: 0 }, mouse: { x: 0, y: 0 } });
    const [isMinimized, _setIsMinimized] = useState(false);
    const floatingRef = useRef<HTMLDivElement>(null);

    const { serialOptions } = useGlobalVariableContext()
    const { t } = useTranslation("game_view")

    // 主题颜色配置
    const themeColors = {
        light: {
            background: 'rgba(248, 250, 252, 0.95)',
            text: '#1a1a1a',
            textSecondary: '#666666',
            grid: 'rgba(0, 0, 0, 0.08)',
            tooltipBg: '#ffffff',
            tooltipText: '#1a1a1a',
            sliderHandle: '#3b82f6',
            sliderBg: 'rgba(59, 130, 246, 0.1)',
            titleColor: '#1e293b',
            // 线条配色方案 - 浅色主题
            lineColors: [
                '#3b82f6', // 蓝色
                '#ef4444', // 红色
                '#10b981', // 绿色
                '#f59e0b', // 橙色
                '#8b5cf6', // 紫色
                '#06b6d4', // 青色
                '#f97316', // 橘色
                '#84cc16', // 青绿色
                '#ec4899', // 粉色
                '#6366f1', // 靛蓝色
            ]
        },
        dark: {
            background: 'rgba(15, 23, 42, 0.95)',
            text: '#e2e8f0',
            textSecondary: '#94a3b8',
            grid: 'rgba(255, 255, 255, 0.1)',
            tooltipBg: '#0f172a',
            tooltipText: '#e2e8f0',
            sliderHandle: '#60a5fa',
            sliderBg: 'rgba(96, 165, 250, 0.1)',
            titleColor: '#e2e8f0',
            // 线条配色方案 - 深色主题
            lineColors: [
                '#60a5fa', // 亮蓝色
                '#f87171', // 亮红色
                '#34d399', // 亮绿色
                '#fbbf24', // 亮橙色
                '#a78bfa', // 亮紫色
                '#22d3ee', // 亮青色
                '#fb923c', // 亮橘色
                '#a3e635', // 亮青绿色
                '#f472b6', // 亮粉色
                '#818cf8', // 亮靛蓝色
            ]
        }
    };

    const currentTheme = themeColors[theme];

    // 获取窗口边界
    const getWindowBounds = (currentSize: { width: number, height: number }) => {
        return {
            maxX: window.innerWidth - currentSize.width,
            maxY: window.innerHeight - currentSize.height,
            minX: 0,
            minY: 0
        };
    };

    // 限制位置在窗口内
    const constrainPosition = (pos: { x: number, y: number }, currentSize: { width: number, height: number } = size) => {
        const bounds = getWindowBounds(currentSize);
        return {
            x: Math.max(bounds.minX, Math.min(bounds.maxX, pos.x)),
            y: Math.max(bounds.minY, Math.min(bounds.maxY, pos.y))
        };
    };

    // 拖动处理函数
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isFloating || isMinimized) return;
        setIsDragging(true);
        // 计算鼠标相对于悬浮窗左上角的偏移量
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isFloating) return;

        if (isDragging) {
            // 计算悬浮窗左上角的新绝对位置
            const newPosition = {
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            };
            // 应用边界约束
            const constrainedPosition = constrainPosition(newPosition, size);
            setPosition(constrainedPosition);
        } else if (isResizing) {
            const deltaX = e.clientX - resizeStart.mouse.x;
            const deltaY = e.clientY - resizeStart.mouse.y;

            let newSize = { ...resizeStart.size };
            let newPosition = { ...resizeStart.position };

            if (resizeType.includes('right')) {
                newSize.width = Math.max(300, resizeStart.size.width + deltaX);
            }
            if (resizeType.includes('left')) {
                const proposedWidth = Math.max(300, resizeStart.size.width - deltaX);
                const widthChange = proposedWidth - resizeStart.size.width;
                newSize.width = proposedWidth;
                newPosition.x = resizeStart.position.x - widthChange;
            }
            if (resizeType.includes('bottom')) {
                newSize.height = Math.max(200, resizeStart.size.height + deltaY);
            }
            if (resizeType.includes('top')) {
                const proposedHeight = Math.max(200, resizeStart.size.height - deltaY);
                const heightChange = proposedHeight - resizeStart.size.height;
                newSize.height = proposedHeight;
                newPosition.y = resizeStart.position.y - heightChange;
            }

            // 先设置新尺寸
            setSize(newSize);
            // 然后用新尺寸约束位置
            const constrainedPosition = constrainPosition(newPosition, newSize);
            setPosition(constrainedPosition);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeType('');
    };

    // 调整大小处理
    const handleResizeStart = (e: React.MouseEvent, type: string) => {
        if (!isFloating || isMinimized) return;
        e.preventDefault();
        e.stopPropagation();

        setIsResizing(true);
        setResizeType(type);
        setResizeStart({
            size: { ...size },
            position: { ...position },
            mouse: { x: e.clientX, y: e.clientY }
        });
    };

    // 保存图表为图片
    const handleSaveAsImage = () => {
        const chartInstance = chartRef.current?.getEchartsInstance();
        if (!chartInstance) return;

        try {
            const url = chartInstance.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff'
            });

            const link = document.createElement('a');
            link.href = url;
            link.download = `${gameInfo?.name || 'CTF'}_${t("scoreboard.png")}_${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error(t("scoreboard.png_error"), error);
        }
    };

    useEffect(() => {
        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragStart, size]);

    // 窗口大小变化监听
    useEffect(() => {
        const handleResize = () => {
            if (isFloating) {
                setPosition(prevPos => constrainPosition(prevPos, size));
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isFloating, size]);

    useEffect(() => {

    }, [serData]);

    useEffect(() => {

        const updateChartMethod = () => {
            if (!gameInfo) return;
            if (!serialOptions.current.length) return;

            const chartInstance: ECharts | undefined = chartRef.current?.getEchartsInstance();
            if (!chartInstance) return;

            let lastestTime = +dayjs(gameInfo.end_time)

            chartInstance.setOption({
                xAxis: {
                    max: dayjs(lastestTime).toDate()
                },
                series: serialOptions.current.map((serie, index) => ({
                    ...serie,
                    lineStyle: {
                        width: 3,
                        shadowColor: currentTheme.lineColors[index % currentTheme.lineColors.length] + '40',
                        shadowBlur: 8,
                        shadowOffsetY: 4,
                        cap: 'round',
                        join: 'round'
                    },
                    itemStyle: {
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        shadowColor: currentTheme.lineColors[index % currentTheme.lineColors.length] + '60',
                        shadowBlur: 6,
                        shadowOffsetY: 2
                    },
                    areaStyle: serie.type === 'line' ? {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: currentTheme.lineColors[index % currentTheme.lineColors.length] + '30'
                                },
                                {
                                    offset: 1,
                                    color: currentTheme.lineColors[index % currentTheme.lineColors.length] + '08'
                                }
                            ]
                        }
                    } : undefined,
                    symbol: 'circle',
                    symbolSize: 6,
                    smooth: 0.3,
                    emphasis: {
                        focus: 'series',
                        scale: 1.1,
                        animationDuration: 200,
                        animationEasing: 'cubicInOut',
                        lineStyle: {
                            width: 4,
                            shadowBlur: 12,
                            shadowOffsetY: 6
                        },
                        itemStyle: {
                            borderWidth: 3,
                            shadowBlur: 10,
                            shadowOffsetY: 4
                        }
                    },
                    blur: {
                        lineStyle: {
                            opacity: 0.1
                        },
                        itemStyle: {
                            opacity: 0.1
                        },
                        areaStyle: {
                            opacity: 0
                        }
                    }
                }))
            });

            // 更新完成
            if (serialOptions.current[1]) {
                lastSerData.current = JSON.stringify(serialOptions.current[1].data)
            }
        }

        // 仅在游戏信息可用时启动定时器
        if (!gameInfo) return;

        updateChartMethod()
        const updateIns = setInterval(() => {
            if (serialOptions.current[1]) {
                if (JSON.stringify(serialOptions.current[1].data) == lastSerData.current) return
            }
            updateChartMethod()
        }, 1000)

        return () => {
            clearInterval(updateIns)
        }
    }, [currentTheme]) // 只依赖主题，移除gameInfo和serialOptions依赖

    const chartOption: EChartsOption = {
        backgroundColor: 'transparent',
        animation: true,
        animationDuration: 300,
        animationEasing: 'cubicOut',
        animationDelay: 0,
        animationDurationUpdate: 200,
        animationEasingUpdate: 'cubicInOut',
        animationDelayUpdate: 0,
        // 高亮动画配置
        hoverLayerThreshold: 3000,
        useUTC: false,
        // 添加颜色调色板
        color: currentTheme.lineColors,
        grid: {
            left: '60px',
            right: '50px',
            top: '80px',
            bottom: '105px', // 增加底部边距为图例留出空间
            borderColor: currentTheme.grid,
            borderWidth: 1,
            backgroundColor: 'transparent'
        },
        legend: {
            show: true,
            type: 'scroll',
            orient: 'horizontal',
            left: 'center',
            bottom: 0,
            padding: [8, 12],
            backgroundColor: currentTheme.background,
            borderColor: currentTheme.grid,
            borderWidth: 1,
            borderRadius: 8,
            textStyle: {
                color: currentTheme.text,
                fontSize: 12,
                fontWeight: 500
            },
            itemGap: 15,
            itemWidth: 14,
            itemHeight: 14,
            pageButtonItemGap: 8,
            pageButtonGap: 10,
            pageButtonPosition: 'end',
            pageFormatter: '{current}/{total}',
            pageTextStyle: {
                color: currentTheme.textSecondary,
                fontSize: 11
            },
            pageIconColor: currentTheme.text,
            pageIconInactiveColor: currentTheme.textSecondary,
            pageIconSize: 12
        },
        tooltip: {
            trigger: 'axis',
            borderWidth: 0,
            borderRadius: 12,
            padding: [12, 16],
            showDelay: 0,
            hideDelay: 100,
            enterable: true,
            transitionDuration: 0.2,
            textStyle: {
                fontSize: 14,
                color: currentTheme.tooltipText,
                fontWeight: 500
            },
            backgroundColor: currentTheme.tooltipBg,
            extraCssText: `
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                backdrop-filter: blur(10px);
                border: 1px solid ${currentTheme.grid};
            `,
            axisPointer: {
                type: 'cross',
                lineStyle: {
                    color: currentTheme.sliderHandle,
                    width: 2,
                    type: 'dashed'
                },
                crossStyle: {
                    color: currentTheme.sliderHandle,
                    width: 1,
                    opacity: 0.6
                },
                label: {
                    backgroundColor: currentTheme.sliderHandle,
                    borderColor: currentTheme.sliderHandle,
                    borderWidth: 1,
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 500,
                    shadowBlur: 4,
                    shadowColor: 'rgba(0, 0, 0, 0.3)'
                }
            }
        },
        title: {
            left: 'center',
            top: 20,
            text: `${gameInfo?.name} - TOP10`,
            textStyle: {
                color: currentTheme.titleColor,
                fontSize: 20,
                fontWeight: 'bold',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            },
            subtextStyle: {
                color: currentTheme.textSecondary,
                fontSize: 14,
                fontWeight: 400
            }
        },
        toolbox: {
            show: false,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'time',
            min: dayjs(gameInfo?.start_time).toDate(),
            max: dayjs(gameInfo?.end_time).toDate(),
            axisLabel: {
                color: currentTheme.textSecondary,
                fontSize: 12,
                fontWeight: 500,
                formatter: (value: number) => dayjs(value).format('MM-DD HH:mm')
            },
            axisLine: {
                lineStyle: {
                    color: currentTheme.grid,
                    width: 2
                }
            },
            axisTick: {
                lineStyle: {
                    color: currentTheme.grid
                }
            },
            splitLine: {
                show: false,
            },
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
            max: (value: { max: number }) => (Math.floor(value.max / 1000) + 1) * 1000,
            axisLabel: {
                color: currentTheme.textSecondary,
                fontSize: 12,
                fontWeight: 500,
                formatter: (value: number) => value.toLocaleString()
            },
            axisLine: {
                lineStyle: {
                    color: currentTheme.grid,
                    width: 2
                }
            },
            axisTick: {
                lineStyle: {
                    color: currentTheme.grid
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: currentTheme.grid,
                    width: 1,
                    type: 'dashed',
                    opacity: 0.6
                }
            },
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
                xAxisIndex: 0,
                filterMode: 'none'
            },
            {
                type: 'slider',
                xAxisIndex: 0,
                start: 0,
                end: 100,
                height: 20,
                bottom: 50, // 调整到图例上方
                showDetail: false,
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                fillerColor: currentTheme.sliderHandle + '20',
                borderRadius: 10,
                dataBackground: {
                    lineStyle: {
                        color: currentTheme.grid,
                        width: 1,
                        opacity: 0.3
                    },
                    areaStyle: {
                        color: currentTheme.grid,
                        opacity: 0.1
                    }
                },
                selectedDataBackground: {
                    lineStyle: {
                        color: currentTheme.sliderHandle,
                        width: 1.5,
                        opacity: 0.6
                    },
                    areaStyle: {
                        color: currentTheme.sliderHandle,
                        opacity: 0.15
                    }
                },
                labelFormatter: (value: number) => dayjs(value).format('MM-DD HH:mm'),
                textStyle: {
                    color: currentTheme.textSecondary,
                    fontSize: 10,
                    fontWeight: 500
                },
                handleIcon: 'circle',
                handleSize: 12,
                handleStyle: {
                    color: currentTheme.sliderHandle,
                    shadowBlur: 4,
                    shadowColor: currentTheme.sliderHandle + '30',
                    shadowOffsetX: 0,
                    shadowOffsetY: 1,
                    borderWidth: 2,
                    borderColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    opacity: 0.9
                },
                moveHandleStyle: {
                    color: currentTheme.sliderHandle,
                    opacity: 0.6,
                    borderRadius: 2
                }
            },
            {
                type: 'inside',
                start: 0,
                end: 100,
                yAxisIndex: 0,
                filterMode: 'none',
            },
            {
                type: 'slider',
                yAxisIndex: 0,
                start: 0,
                end: 100,
                width: 18,
                right: 15,
                showDetail: false,
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                fillerColor: currentTheme.sliderHandle + '20',
                borderRadius: 9,
                dataBackground: {
                    lineStyle: {
                        color: currentTheme.grid,
                        width: 1,
                        opacity: 0.3
                    },
                    areaStyle: {
                        color: currentTheme.grid,
                        opacity: 0.1
                    }
                },
                selectedDataBackground: {
                    lineStyle: {
                        color: currentTheme.sliderHandle,
                        width: 1.5,
                        opacity: 0.6
                    },
                    areaStyle: {
                        color: currentTheme.sliderHandle,
                        opacity: 0.15
                    }
                },
                labelFormatter: (value: number) => value.toFixed(0),
                textStyle: {
                    color: currentTheme.textSecondary,
                    fontSize: 10,
                    fontWeight: 500
                },
                handleIcon: 'circle',
                handleSize: 12,
                handleStyle: {
                    color: currentTheme.sliderHandle,
                    shadowBlur: 4,
                    shadowColor: currentTheme.sliderHandle + '30',
                    shadowOffsetX: 0,
                    shadowOffsetY: 1,
                    borderWidth: 2,
                    borderColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    opacity: 0.9
                },
                moveHandleStyle: {
                    color: currentTheme.sliderHandle,
                    opacity: 0.6,
                    borderRadius: 2
                }
            },
        ],
        series: []
    };

    return (
        <div
            ref={floatingRef}
            className={`w-full h-full ${isFullscreen ? '' : 'pr-[2%]'} ${isFloating ? 'cursor-move select-none' : ''
                } ${isFloating ? 'floating-chart opacity-40 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300' : ''
                }`}
            style={isFloating ? {
                transform: `translate(${position.x}px, ${position.y}px)`,
                width: `${size.width}px`,
                height: `${size.height}px`
            } : undefined}
            tabIndex={isFloating ? 0 : undefined}
        >
            <div className={`w-full h-full overflow-hidden backdrop-blur-md relative ${isFullscreen ? 'rounded-lg' : 'rounded-2xl'
                } ${theme === 'dark'
                    ? 'bg-slate-900/80 border border-slate-700/50'
                    : 'bg-slate-50/100 border border-gray-300/70'
                } ${isFloating ? 'shadow-2xl border-2' : ''
                }`}>
                {/* 调整大小句柄 */}
                {isFloating && !isMinimized && (
                    <>
                        {/* 右边缘 */}
                        <div
                            className="absolute top-8 right-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-500/30 z-30"
                            onMouseDown={(e) => handleResizeStart(e, 'right')}
                        />
                        {/* 底边缘 */}
                        <div
                            className="absolute left-0 bottom-0 right-0 h-2 cursor-ns-resize hover:bg-blue-500/30 z-30"
                            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
                        />
                        {/* 左边缘 */}
                        <div
                            className="absolute top-8 left-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-500/30 z-30"
                            onMouseDown={(e) => handleResizeStart(e, 'left')}
                        />
                        {/* 顶边缘 */}
                        <div
                            className="absolute top-8 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-500/30 z-30"
                            onMouseDown={(e) => handleResizeStart(e, 'top')}
                        />
                        {/* 角落 - 尺寸更大，更容易点击 */}
                        <div
                            className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize hover:bg-blue-500/50 z-40"
                            onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
                        />
                        <div
                            className="absolute bottom-0 left-0 w-4 h-4 cursor-ne-resize hover:bg-blue-500/50 z-40"
                            onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
                        />
                        <div
                            className="absolute top-8 right-0 w-4 h-4 cursor-ne-resize hover:bg-blue-500/50 z-40"
                            onMouseDown={(e) => handleResizeStart(e, 'top-right')}
                        />
                        <div
                            className="absolute top-8 left-0 w-4 h-4 cursor-nw-resize hover:bg-blue-500/50 z-40"
                            onMouseDown={(e) => handleResizeStart(e, 'top-left')}
                        />
                    </>
                )}

                {/* 悬浮窗拖动栏 */}
                {isFloating && (
                    <div
                        className={`absolute top-0 left-0 right-0 h-8 z-20 cursor-move flex items-center justify-between px-3 ${theme === 'dark' ? 'bg-slate-800/90' : 'bg-gray-100/90'
                            } rounded-t-2xl border-b`}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="flex items-center gap-2">
                            <Move className="w-3 h-3 opacity-60" />
                            <span className="text-xs font-medium opacity-75">{t("scoreboard.png")}</span>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSaveAsImage}
                                className="p-1 h-5 w-5 rounded hover:bg-green-500/20"
                                title={t("scoreboard.save_png")}
                            >
                                <Download className="w-3 h-3" />
                            </Button>
                            {onMinimize && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onMinimize}
                                    className="p-1 h-5 w-5 rounded hover:bg-yellow-500/20"
                                >
                                    <Minus className="w-3 h-3" />
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onToggleFloating}
                                className="p-1 h-5 w-5 rounded hover:bg-red-500/20"
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* 全屏/悬浮窗切换按钮 */}
                {!isFloating && (
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSaveAsImage}
                            className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 ${theme === 'dark'
                                ? 'bg-slate-800/80 border border-slate-600/50 text-slate-200 hover:bg-slate-700/80'
                                : 'bg-white/80 border border-gray-300/50 text-slate-700 hover:bg-gray-50/80'
                                }`}
                            title={t("scoreboard.save_png")}
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                        {onMinimize && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onMinimize}
                                className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 ${theme === 'dark'
                                    ? 'bg-slate-800/80 border border-slate-600/50 text-slate-200 hover:bg-slate-700/80'
                                    : 'bg-white/80 border border-gray-300/50 text-slate-700 hover:bg-gray-50/80'
                                    }`}
                                title={t("scoreboard.minimize")}
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                        )}
                        {onToggleFloating && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onToggleFloating}
                                className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 ${theme === 'dark'
                                    ? 'bg-slate-800/80 border border-slate-600/50 text-slate-200 hover:bg-slate-700/80'
                                    : 'bg-white/80 border border-gray-300/50 text-slate-700 hover:bg-gray-50/80'
                                    }`}
                                title={t("scoreboard.floating")}
                            >
                                <Move className="w-4 h-4" />
                            </Button>
                        )}
                        {onToggleFullscreen && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onToggleFullscreen}
                                className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 ${theme === 'dark'
                                    ? 'bg-slate-800/80 border border-slate-600/50 text-slate-200 hover:bg-slate-700/80'
                                    : 'bg-white/80 border border-gray-300/50 text-slate-700 hover:bg-gray-50/80'
                                    }`}
                                title={isFullscreen ? t("scoreboard.quit_full") : t("scoreboard.enter_full")}
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="w-4 h-4" />
                                ) : (
                                    <Maximize2 className="w-4 h-4" />
                                )}
                            </Button>
                        )}
                    </div>
                )}
                <ReactECharts
                    className={`${isFloating ? 'pt-8 p-2' : 'p-4'}`}
                    ref={chartRef}
                    option={chartOption}
                    style={{ height: '100%' }}
                    opts={{ renderer: 'canvas' }}
                />
            </div>
        </div>
    );
};

// 优化memo比较函数，只比较关键props
export default React.memo(BetterChart, (prevProps, nextProps) => {
    // 比较关键props
    return (
        prevProps.theme === nextProps.theme &&
        prevProps.isFullscreen === nextProps.isFullscreen &&
        prevProps.isFloating === nextProps.isFloating &&
        prevProps.gameInfo?.game_id === nextProps.gameInfo?.game_id &&
        prevProps.gameInfo?.name === nextProps.gameInfo?.name &&
        prevProps.gameInfo?.start_time === nextProps.gameInfo?.start_time &&
        prevProps.gameInfo?.end_time === nextProps.gameInfo?.end_time &&
        prevProps.onToggleFullscreen === nextProps.onToggleFullscreen &&
        prevProps.onToggleFloating === nextProps.onToggleFloating &&
        prevProps.onMinimize === nextProps.onMinimize
    );
});