import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user by ID
    const user = await auth.getUserById(authToken)

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    // Get all data for statistics
    const allUsers = await auth.getAllUsers()
    const allSubmissions = await auth.getAllSubmissions()
    const pendingSubmissions = await auth.getPendingSubmissions()

    // Calculate basic statistics
    const stats = {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => !u.isBanned).length,
      bannedUsers: allUsers.filter(u => u.isBanned).length,
      pendingSubmissions: pendingSubmissions.length,
      approvedSubmissions: allSubmissions.filter(s => s.status === 'approved').length,
      rejectedSubmissions: allSubmissions.filter(s => s.status === 'rejected').length,
      totalScripts: allSubmissions.filter(s => s.type === 'script').length,
      totalTools: allSubmissions.filter(s => s.type === 'tool').length,
      totalEbooks: allSubmissions.filter(s => s.type === 'ebook').length,
      totalReports: 0, // Placeholder for future reports system
      totalRatings: allUsers.reduce((sum, user) => sum + user.stats.likesGiven, 0),
    }

    // Calculate submission trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentSubmissions = allSubmissions.filter(s => 
      new Date(s.submittedAt) >= thirtyDaysAgo
    )

    // Group submissions by date for trend analysis
    const submissionTrends = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const daySubmissions = recentSubmissions.filter(s => 
        new Date(s.submittedAt).toISOString().split('T')[0] === dateStr
      )
      
      submissionTrends.push({
        date: dateStr,
        total: daySubmissions.length,
        scripts: daySubmissions.filter(s => s.type === 'script').length,
        tools: daySubmissions.filter(s => s.type === 'tool').length,
        ebooks: daySubmissions.filter(s => s.type === 'ebook').length,
      })
    }

    // Calculate submission type distribution for pie chart
    const submissionTypes = [
      { name: 'Scripts', value: stats.totalScripts, color: '#10B981' },
      { name: 'Tools', value: stats.totalTools, color: '#3B82F6' },
      { name: 'E-Books', value: stats.totalEbooks, color: '#F59E0B' },
    ]

    // Calculate status distribution for pie chart
    const submissionStatuses = [
      { name: 'Pending', value: stats.pendingSubmissions, color: '#F59E0B' },
      { name: 'Approved', value: stats.approvedSubmissions, color: '#10B981' },
      { name: 'Rejected', value: stats.rejectedSubmissions, color: '#EF4444' },
    ]

    // Calculate user activity (submissions per user)
    const userActivity = allUsers.map(user => {
      const userSubmissions = allSubmissions.filter(s => s.submittedBy === user.id).length
      const totalContributions = userSubmissions + user.stats.likesGiven + user.stats.sharesMade + user.stats.reportsSubmitted
      
      return {
        username: user.username,
        submissions: userSubmissions,
        ratings: user.stats.likesGiven,
        contributions: totalContributions,
      }
    }).sort((a, b) => b.submissions - a.submissions).slice(0, 10)

    // Calculate monthly growth
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const thisMonthSubmissions = allSubmissions.filter(s => {
      const submissionDate = new Date(s.submittedAt)
      return submissionDate.getMonth() === currentMonth && 
             submissionDate.getFullYear() === currentYear
    }).length

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const lastMonthSubmissions = allSubmissions.filter(s => {
      const submissionDate = new Date(s.submittedAt)
      return submissionDate.getMonth() === lastMonth && 
             submissionDate.getFullYear() === lastMonthYear
    }).length

    const monthlyGrowth = lastMonthSubmissions > 0 
      ? ((thisMonthSubmissions - lastMonthSubmissions) / lastMonthSubmissions * 100).toFixed(1)
      : thisMonthSubmissions > 0 ? '100' : '0'

    return NextResponse.json({
      ...stats,
      submissionTrends,
      submissionTypes,
      submissionStatuses,
      userActivity,
      monthlyGrowth: parseFloat(monthlyGrowth),
      thisMonthSubmissions,
      lastMonthSubmissions,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 