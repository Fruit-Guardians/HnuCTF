import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Slider } from '../ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { useTheme } from 'next-themes';

interface ChallengeScoreGraphProps {
    S?: number; // 原始分值
    r?: number; // 最低分值比例
    d?: number; // 难度系数
    maxX?: number; // 最大提交次数
    onDChange: (v: number) => void;
}

export default function ChallengeScoreGraph({
    S = 1000,
    r = 0.3,
    d = 20,
    maxX = 100,
    onDChange
}: ChallengeScoreGraphProps) {
    const difficultyFactor = d;
    const [highlightX] = useState([3]); // 固定提交次数为10

    const { theme } = useTheme();

    // 根据主题获取颜色
    const isDark = theme === 'dark';
    const colors = {
        background: isDark ? '#1f2937' : '#ffffff',
        border: isDark ? '#374151' : '#e5e7eb',
        text: isDark ? '#f9fafb' : '#111827',
        grid: isDark ? '#374151' : '#e5e7eb',
        axis: isDark ? '#9ca3af' : '#6b7280',
        primary: isDark ? '#60a5fa' : '#3b82f6',
        destructive: isDark ? '#f87171' : '#ef4444'
    };

    // 计算分数函数 f(S, r, d, x)
    const calculateScore = (S: number, r: number, d: number, x: number): number => {
        return Math.floor(S * (r + (1 - r) * Math.exp((1 - x) / d)));
    };

    // 生成图表数据
    const chartData = useMemo(() => {
        const data = [];
        const currentD = difficultyFactor;
        for (let x = 1; x <= maxX; x++) {
            const score = calculateScore(S, r, currentD, x);
            data.push({
                x,
                score,
                isHighlighted: x === highlightX[0]
            });
        }
        return data;
    }, [S, r, difficultyFactor, maxX, highlightX]);

    const highlightedScore = calculateScore(S, r, difficultyFactor, highlightX[0]);

    return (
        <Card className="w-full bg-background/30 select-none shadow-none">
            <CardHeader>
                <CardTitle>题目分数变化曲线</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 滑块控制 */}
                <div className="gap-3 flex flex-col">
                    <Label>难度系数 (d): {difficultyFactor}</Label>
                    <Slider
                        value={[difficultyFactor]}
                        onValueChange={(v) => {
                            onDChange(v[0])
                        }}
                        min={1}
                        max={100}
                        step={0.1}
                        className="w-full"
                    />
                </div>

                {/* 图表 */}
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 30, right: 80, left: 50, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.5} />
                            <XAxis
                                dataKey="x"
                                stroke={colors.axis}
                                fontSize={12}
                                tickLine={{ stroke: colors.axis }}
                                axisLine={{ stroke: colors.axis }}
                                label={{ value: '提交次数 (x)', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle' } }}
                            />
                            <YAxis
                                stroke={colors.axis}
                                fontSize={12}
                                tickLine={{ stroke: colors.axis }}
                                axisLine={{ stroke: colors.axis }}
                                label={{ value: '分数', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                            />
                            <Tooltip
                                formatter={(value, _name) => [value, '分数']}
                                labelFormatter={(label) => `提交次数: ${label}`}
                                contentStyle={{
                                    backgroundColor: colors.background,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '6px',
                                    boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    color: colors.text,
                                    padding: '6px 8px',
                                    fontSize: '12px',
                                    lineHeight: '1.2'
                                }}
                            />

                            {/* 主曲线 */}
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke={colors.primary}
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: colors.primary, stroke: colors.background, strokeWidth: 2 }}
                            />

                            {/* 突出显示的垂直线 */}
                            <ReferenceLine
                                x={highlightX[0]}
                                stroke={colors.destructive}
                                strokeWidth={2}
                                strokeDasharray="8 4"
                                label={{ value: `x=${highlightX[0]}`, position: 'top' }}
                            />

                            {/* 突出显示的水平线 */}
                            <ReferenceLine
                                y={highlightedScore}
                                stroke={colors.destructive}
                                strokeWidth={2}
                                strokeDasharray="8 4"
                                label={{
                                    value: `X: ${highlightX[0]} 分数: ${highlightedScore}`,
                                    position: 'insideTopRight',
                                    offset: 10,
                                    style: { fill: colors.text, fontSize: '12px' }
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}