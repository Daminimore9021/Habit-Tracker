'use client'

// Import removed
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface TrendChartProps {
    data: any[]
    title: string
    description: string
    color?: string
    valuePrefix?: string
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/20">
                <p className="font-medium text-gray-900 mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-gray-600 font-medium">
                        {payload[0].value}% Complete
                    </span>
                </div>
            </div>
        )
    }
    return null
}

export default function TrendChart({
    data,
    title,
    description,
    color = "#3b82f6",
    trend,
    trendValue
}: TrendChartProps) {
    return (
        <div className="overflow-hidden border-none shadow-lg glass-card hover:shadow-xl transition-all duration-300 rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-200">{title}</h3>
                        <p className="text-gray-400 mt-1 text-sm">{description}</p>
                    </div>
                    {trend && (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${trend === 'up' ? 'bg-green-500/10 text-green-400' :
                            trend === 'down' ? 'bg-red-500/10 text-red-400' :
                                'bg-gray-500/10 text-gray-400'
                            }`}>
                            {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                            {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                            {trend === 'neutral' && <Minus className="w-3 h-3" />}
                            {trendValue}
                        </div>
                    )}
                </div>
            </div>
            <div>
                <div className="h-[200px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area
                                type="monotone"
                                dataKey="percentage"
                                stroke={color}
                                strokeWidth={3}
                                fill={`url(#gradient-${title})`}
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
