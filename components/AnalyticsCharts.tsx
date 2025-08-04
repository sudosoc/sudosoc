'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface ChartData {
  name: string
  value: number
  color: string
}

interface TrendData {
  date: string
  total: number
  scripts: number
  tools: number
  ebooks: number
}

interface AnalyticsChartsProps {
  submissionTypes: ChartData[]
  submissionStatuses: ChartData[]
  submissionTrends: TrendData[]
  userActivity: Array<{
    username: string
    submissions: number
    ratings: number
    contributions: number
  }>
  monthlyGrowth: number
  thisMonthSubmissions: number
  lastMonthSubmissions: number
}

export function PieChart({ data, title }: { data: ChartData[], title: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  if (total === 0) {
    return (
      <div className="bg-dark-700 rounded flex items-center justify-center h-64">
        <p className="text-gray-400">No data available</p>
      </div>
    )
  }

  let currentAngle = 0
  const radius = 120 // Increased from 80 to 120
  const centerX = 150 // Increased from 100 to 150
  const centerY = 150 // Increased from 100 to 150

  const paths = data.map((item, index) => {
    const percentage = item.value / total
    const angle = percentage * 2 * Math.PI
    const startAngle = currentAngle
    const endAngle = currentAngle + angle

    const x1 = centerX + radius * Math.cos(startAngle)
    const y1 = centerY + radius * Math.sin(startAngle)
    const x2 = centerX + radius * Math.cos(endAngle)
    const y2 = centerY + radius * Math.sin(endAngle)

    const largeArcFlag = angle > Math.PI ? 1 : 0

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')

    currentAngle += angle

    return (
      <g key={index}>
        <path
          d={pathData}
          fill={item.color}
          className="transition-all duration-500 ease-out hover:opacity-80 animate-pie-segment"
          style={{
            animationDelay: `${index * 0.2}s`,
            animationFillMode: 'both'
          }}
        />
        <text
          x={centerX + (radius * 0.7) * Math.cos(startAngle + angle / 2)}
          y={centerY + (radius * 0.7) * Math.sin(startAngle + angle / 2)}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-semibold fill-white animate-fade-in"
          style={{
            animationDelay: `${index * 0.2 + 0.5}s`,
            animationFillMode: 'both'
          }}
        >
          {Math.round(percentage * 100)}%
        </text>
      </g>
    )
  })

  return (
    <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <svg width="300" height="300" className="mb-4"> {/* Increased from 200x200 to 300x300 */}
          {paths}
        </svg>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm animate-fade-in" style={{
            animationDelay: `${index * 0.1 + 1}s`,
            animationFillMode: 'both'
          }}>
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-300">{item.name}</span>
            </div>
            <span className="text-white font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TrendChart({ data }: { data: TrendData[] }) {
  const maxValue = Math.max(...data.map(d => d.total))
  const width = 600
  const height = 200
  const padding = 40

  if (maxValue === 0) {
    return (
      <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Submission Trends (Last 30 Days)</h3>
        <div className="bg-dark-700 rounded flex items-center justify-center h-48">
          <p className="text-gray-400">No submissions in the last 30 days</p>
        </div>
      </div>
    )
  }

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
    const y = height - padding - (item.total / maxValue) * (height - 2 * padding)
    return { x, y, ...item }
  })

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  return (
    <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Submission Trends (Last 30 Days)</h3>
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="mb-4">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1={padding}
              y1={padding + (i / 4) * (height - 2 * padding)}
              x2={width - padding}
              y2={padding + (i / 4) * (height - 2 * padding)}
              stroke="#374151"
              strokeWidth="1"
            />
          ))}
          
          {/* Trend line */}
          <path
            d={pathData}
            stroke="#EF4444"
            strokeWidth="3"
            fill="none"
            className="animate-draw"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#EF4444"
              className="animate-pulse"
            />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-green-500 font-semibold">
            {data.reduce((sum, d) => sum + d.scripts, 0)}
          </div>
          <div className="text-gray-400">Scripts</div>
        </div>
        <div className="text-center">
          <div className="text-blue-500 font-semibold">
            {data.reduce((sum, d) => sum + d.tools, 0)}
          </div>
          <div className="text-gray-400">Tools</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-500 font-semibold">
            {data.reduce((sum, d) => sum + d.ebooks, 0)}
          </div>
          <div className="text-gray-400">E-Books</div>
        </div>
      </div>
    </div>
  )
}

export function UserActivityChart({ data }: { data: AnalyticsChartsProps['userActivity'] }) {
  if (data.length === 0) {
    return (
      <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Contributors</h3>
        <div className="bg-dark-700 rounded flex items-center justify-center h-48">
          <p className="text-gray-400">No user activity data</p>
        </div>
      </div>
    )
  }

  const maxSubmissions = Math.max(...data.map(d => d.submissions))

  return (
    <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Top Contributors</h3>
      <div className="space-y-3">
        {data.map((user, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{user.username}</div>
              <div className="text-gray-400 text-sm">
                {user.submissions} submissions • {user.ratings} ratings
              </div>
            </div>
            <div className="w-24 bg-dark-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(user.submissions / maxSubmissions) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnimatedCounter({ value, label, icon: Icon, color = "text-white" }: {
  value: number
  label: string
  icon: any
  color?: string
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1000 // 1 second
    const steps = 60
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current += increment
      if (step >= steps) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
      <div className="flex items-center">
        <Icon className={`h-8 w-8 ${color} mr-3`} />
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{displayValue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

export function GrowthIndicator({ growth, thisMonth, lastMonth }: {
  growth: number
  thisMonth: number
  lastMonth: number
}) {
  const isPositive = growth >= 0
  
  return (
    <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Monthly Growth</h3>
      <div className="flex items-center space-x-3">
        {isPositive ? (
          <TrendingUp className="h-6 w-6 text-green-500" />
        ) : (
          <TrendingDown className="h-6 w-6 text-red-500" />
        )}
        <div>
          <div className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{growth}%
          </div>
          <div className="text-gray-400 text-sm">
            {thisMonth} vs {lastMonth} submissions
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsCharts({
  submissionTypes,
  submissionStatuses,
  submissionTrends,
  userActivity,
  monthlyGrowth,
  thisMonthSubmissions,
  lastMonthSubmissions,
}: AnalyticsChartsProps) {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedCounter
          value={submissionTypes.reduce((sum, t) => sum + t.value, 0)}
          label="Total Submissions"
          icon={({ className }: { className: string }) => (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          color="text-blue-500"
        />
        <AnimatedCounter
          value={submissionStatuses.find(s => s.name === 'Pending')?.value || 0}
          label="Pending Review"
          icon={({ className }: { className: string }) => (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          color="text-yellow-500"
        />
        <AnimatedCounter
          value={submissionStatuses.find(s => s.name === 'Approved')?.value || 0}
          label="Approved"
          icon={({ className }: { className: string }) => (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          color="text-green-500"
        />
        <GrowthIndicator
          growth={monthlyGrowth}
          thisMonth={thisMonthSubmissions}
          lastMonth={lastMonthSubmissions}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart data={submissionTypes} title="Submission Types" />
        <PieChart data={submissionStatuses} title="Submission Status" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart data={submissionTrends} />
        <UserActivityChart data={userActivity} />
      </div>
    </div>
  )
} 