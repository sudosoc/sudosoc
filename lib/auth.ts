// Simple in-memory user store for demo purposes
// In a real app, this would be a database

interface User {
  id: string
  username: string
  email: string
  password: string // In real app, this would be hashed
  isAdmin: boolean
  isBanned?: boolean
  createdAt: Date
  stats: {
    scriptsSubmitted: number
    likesGiven: number
    sharesMade: number
    contributions: number
    reportsSubmitted: number
  }
  contributions: {
    scripts: string[]
    ratings: Array<{ itemId: string; itemType: 'tool' | 'script' | 'ebook'; rating: number }>
    shares: Array<{ itemId: string; itemType: 'tool' | 'script' | 'ebook' }>
    reports: Array<{ 
      itemId: string; 
      itemType: 'tool' | 'script' | 'ebook'; 
      reason?: string; 
      description?: string 
    }>
  }
  notifications: Array<{
    id: string
    type: 'approval' | 'rejection' | 'system'
    message: string
    itemId?: string
    itemType?: string
    read: boolean
    createdAt: Date
  }>
}

import { storage } from './storage'

// Get users and submissions from persistent storage
let users: User[] = []
let submissions: Array<{
  id: string
  type: 'script' | 'tool' | 'ebook' | 'article'
  title: string
  description: string
  content: any
  submittedBy: string
  submittedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: Date
  reviewNotes?: string
}> = []

// Initialize data from storage
const initializeData = () => {
  try {
    const storedUsers = storage.getUsers()
    const storedSubmissions = storage.getSubmissions()
    
    if (storedUsers.length > 0) {
      users = storedUsers.map(user => ({
        ...user,
        createdAt: new Date(user.createdAt),
        notifications: user.notifications?.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        })) || []
      }))
    }
    
    if (storedSubmissions.length > 0) {
      submissions = storedSubmissions.map(sub => ({
        ...sub,
        submittedAt: new Date(sub.submittedAt),
        reviewedAt: sub.reviewedAt ? new Date(sub.reviewedAt) : undefined
      }))
    }
  } catch (error) {
    console.error('Error initializing data from storage:', error)
  }
}

// Always initialize data from storage on module load
initializeData();

export const auth = {
  // Register a new user
  register: async (username: string, email: string, password: string): Promise<User> => {
    // Check if username or email already exists
    const existingUser = users.find(
      user => user.username === username || user.email === email
    )
    
    if (existingUser) {
      throw new Error('Username or email already exists')
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      password, // In real app, hash this with bcrypt
      isAdmin: false,
      createdAt: new Date(),
      stats: {
        scriptsSubmitted: 0,
        likesGiven: 0,
        sharesMade: 0,
        contributions: 0,
        reportsSubmitted: 0,
      },
      contributions: {
        scripts: [],
        ratings: [],
        shares: [],
        reports: [],
      },
      notifications: [],
    }

    users.push(newUser)
    storage.setUsers(users) // Persist to storage
    return newUser
  },

  // Login user
  login: async (email: string, password: string): Promise<User> => {
    const user = users.find(
      user => user.email === email && user.password === password
    )

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Check if user is banned
    if (user.isBanned) {
      throw new Error('Your account is currently banned. Please contact an administrator.')
    }

    return user
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User | null> => {
    return users.find(user => user.id === id) || null
  },

  // Get all users (for admin)
  getAllUsers: async (): Promise<User[]> => {
    return users
  },

  // Track user activities
  addRating: async (userId: string, itemId: string, itemType: 'tool' | 'script' | 'ebook', rating: number) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      user.contributions.ratings.push({ itemId, itemType, rating })
      user.stats.likesGiven++
      user.stats.contributions++
      storage.setUsers(users) // Persist to storage
    }
  },

  // Check if user has already rated an item
  getRating: async (userId: string, itemId: string, itemType: 'tool' | 'script' | 'ebook') => {
    const user = users.find(u => u.id === userId)
    if (user) {
      return user.contributions.ratings.find(
        rating => rating.itemId === itemId && rating.itemType === itemType
      ) || null
    }
    return null
  },

  addShare: async (userId: string, itemId: string, itemType: 'tool' | 'script' | 'ebook') => {
    const user = users.find(u => u.id === userId)
    if (user) {
      user.contributions.shares.push({ itemId, itemType })
      user.stats.sharesMade++
      user.stats.contributions++
    }
  },

  addReport: async (userId: string, itemId: string, itemType: 'tool' | 'script' | 'ebook', reason?: string, description?: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      user.contributions.reports.push({ 
        itemId, 
        itemType, 
        reason: reason || 'No reason provided',
        description: description || 'No description provided'
      })
      user.stats.reportsSubmitted++
      user.stats.contributions++
      storage.setUsers(users) // Persist to storage
    }
  },

  addScript: async (userId: string, scriptId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      user.contributions.scripts.push(scriptId)
      user.stats.scriptsSubmitted++
      user.stats.contributions++
      storage.setUsers(users) // Persist to storage
    }
  },

  // Add notification to user
  addNotification: async (userId: string, notification: {
    type: 'approval' | 'rejection' | 'system'
    message: string
    itemId?: string
    itemType?: string
  }) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      user.notifications.push({
        id: Date.now().toString(),
        ...notification,
        read: false,
        createdAt: new Date(),
      })
      storage.setUsers(users) // Persist to storage
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (userId: string, notificationId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      const notification = user.notifications.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
        storage.setUsers(users) // Persist to storage
      }
    }
  },

  // Delete notification
  deleteNotification: async (userId: string, notificationId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      user.notifications = user.notifications.filter(n => n.id !== notificationId)
      storage.setUsers(users) // Persist to storage
    }
  },

  // Get unread notifications count
  getUnreadNotificationsCount: async (userId: string): Promise<number> => {
    const user = users.find(u => u.id === userId)
    if (user) {
      return user.notifications.filter(n => !n.read).length
    }
    return 0
  },

  // Submission management methods
  addSubmission: async (submission: {
    type: 'script' | 'tool' | 'ebook' | 'article'
    title: string
    description: string
    content: any
    submittedBy: string
  }) => {
    const newSubmission = {
      ...submission,
      id: Date.now().toString(),
      submittedAt: new Date(),
      status: 'pending' as const,
    }
    submissions.push(newSubmission)
    storage.setSubmissions(submissions) // Persist to storage
    
    // Debug logging
    console.log('Submission added:', {
      id: newSubmission.id,
      type: newSubmission.type,
      title: newSubmission.title,
      submittedBy: newSubmission.submittedBy,
      totalSubmissions: submissions.length
    })
    
    return newSubmission
  },

  getPendingSubmissions: async () => {
    const pending = submissions.filter(s => s.status === 'pending')
    console.log('Getting pending submissions:', {
      total: submissions.length,
      pending: pending.length,
      submissions: pending.map(s => ({ id: s.id, type: s.type, title: s.title }))
    })
    return pending
  },

  getAllSubmissions: async () => {
    console.log('Getting all submissions:', submissions.length)
    return submissions
  },

  approveSubmission: async (submissionId: string, reviewedBy: string, reviewNotes?: string) => {
    const submission = submissions.find(s => s.id === submissionId)
    if (submission) {
      submission.status = 'approved'
      submission.reviewedBy = reviewedBy
      submission.reviewedAt = new Date()
      submission.reviewNotes = reviewNotes
      storage.setSubmissions(submissions) // Persist to storage
      return submission
    }
    return null
  },

  rejectSubmission: async (submissionId: string, reviewedBy: string, reviewNotes?: string) => {
    const submission = submissions.find(s => s.id === submissionId)
    if (submission) {
      submission.status = 'rejected'
      submission.reviewedBy = reviewedBy
      submission.reviewedAt = new Date()
      submission.reviewNotes = reviewNotes
      storage.setSubmissions(submissions) // Persist to storage
      return submission
    }
    return null
  },

  getSubmissionById: async (id: string) => {
    return submissions.find(s => s.id === id) || null
  },

  getSubmissionsByUser: async (userId: string) => {
    return submissions.filter(s => s.submittedBy === userId)
  },

  // User management methods
  banUser: async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      user.isBanned = true
      storage.setUsers(users) // Persist to storage
      return user
    }
    return null
  },

  unbanUser: async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      user.isBanned = false
      storage.setUsers(users) // Persist to storage
      return user
    }
    return null
  },

  // Update user information
  updateUser: async (userId: string, updates: {
    username?: string
    email?: string
    isAdmin?: boolean
    isBanned?: boolean
  }): Promise<User | null> => {
    const userIndex = users.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      return null
    }

    // Update the user with new data
    users[userIndex] = {
      ...users[userIndex],
      ...updates
    }

    // Persist to storage
    storage.setUsers(users)
    return users[userIndex]
  },

  // Create a demo user account for testing
  createDemoUserAccount: () => {
    if (users.length === 0) {
      users.push({
        id: 'user-1',
        username: 'user',
        email: 'user@sudosoc.com',
        password: 'user123',
        isAdmin: false,
        createdAt: new Date(),
        stats: {
          scriptsSubmitted: 0,
          likesGiven: 0,
          sharesMade: 0,
          contributions: 0,
          reportsSubmitted: 0,
        },
        contributions: {
          scripts: [],
          ratings: [],
          shares: [],
          reports: [],
        },
        notifications: [],
      });
      storage.setUsers(users);
    }
  },

  // Create a demo admin user
  createDemoUser: () => {
    if (users.length === 0) {
      users.push({
        id: 'admin-1',
        username: 'admin',
        email: 'admin@sudosoc.com',
        password: 'admin123',
        isAdmin: true,
        createdAt: new Date(),
        stats: {
          scriptsSubmitted: 0,
          likesGiven: 0,
          sharesMade: 0,
          contributions: 0,
          reportsSubmitted: 0,
        },
        contributions: {
          scripts: [],
          ratings: [],
          shares: [],
          reports: [],
        },
        notifications: [],
      })
    }
  }
} 

// Ensure default admin and user exist if missing
const hasAdmin = users.some(u => u.email === 'admin@sudosoc.com');
const hasUser = users.some(u => u.email === 'user@sudosoc.com');
let changed = false;
if (!hasAdmin) {
  users.push({
    id: 'admin-1',
    username: 'admin',
    email: 'admin@sudosoc.com',
    password: 'admin123',
    isAdmin: true,
    createdAt: new Date(),
    stats: {
      scriptsSubmitted: 0,
      likesGiven: 0,
      sharesMade: 0,
      contributions: 0,
      reportsSubmitted: 0,
    },
    contributions: {
      scripts: [],
      ratings: [],
      shares: [],
      reports: [],
    },
    notifications: [],
  });
  changed = true;
}
if (!hasUser) {
  users.push({
    id: 'user-1',
    username: 'user',
    email: 'user@sudosoc.com',
    password: 'user123',
    isAdmin: false,
    createdAt: new Date(),
    stats: {
      scriptsSubmitted: 0,
      likesGiven: 0,
      sharesMade: 0,
      contributions: 0,
      reportsSubmitted: 0,
    },
    contributions: {
      scripts: [],
      ratings: [],
      shares: [],
      reports: [],
    },
    notifications: [],
  });
  changed = true;
}
if (changed) {
  storage.setUsers(users);
} 