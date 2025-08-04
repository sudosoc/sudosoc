import { NextRequest, NextResponse } from 'next/server'

// Mock data for now - replace with database calls later
const mockTools = [
  {
    id: '1',
    name: 'Nmap',
    description: 'Network discovery and security auditing tool',
    category: 'network-security',
    url: 'https://nmap.org',
    averageRating: 4.8,
    totalRatings: 1250,
  },
  {
    id: '2',
    name: 'Wireshark',
    description: 'Network protocol analyzer for real-time traffic inspection',
    category: 'network-security',
    url: 'https://wireshark.org',
    averageRating: 4.7,
    totalRatings: 890,
  },
  {
    id: '3',
    name: 'Metasploit Framework',
    description: 'Penetration testing platform for security research',
    category: 'penetration-testing',
    url: 'https://metasploit.com',
    averageRating: 4.9,
    totalRatings: 1567,
  },
  {
    id: '4',
    name: 'Burp Suite',
    description: 'Web application security testing platform',
    category: 'web-security',
    url: 'https://portswigger.net/burp',
    averageRating: 4.6,
    totalRatings: 743,
  },
  {
    id: '5',
    name: 'Autopsy',
    description: 'Digital forensics platform and GUI for The Sleuth Kit',
    category: 'forensics',
    url: 'https://autopsy.com',
    averageRating: 4.4,
    totalRatings: 456,
  },
  {
    id: '6',
    name: 'Cuckoo Sandbox',
    description: 'Automated malware analysis system',
    category: 'malware-analysis',
    url: 'https://cuckoosandbox.org',
    averageRating: 4.5,
    totalRatings: 678,
  },
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(mockTools)
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, category, url } = await request.json()

    // Validate input
    if (!name || !description || !category) {
      return NextResponse.json(
        { message: 'Name, description, and category are required' },
        { status: 400 }
      )
    }

    // Mock successful creation
    return NextResponse.json(
      { 
        id: Date.now().toString(),
        name,
        description,
        category,
        url,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating tool:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 