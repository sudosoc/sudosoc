import { NextRequest, NextResponse } from 'next/server'

// Mock data for now - replace with database calls later
const mockJournalEntries = [
  {
    id: '1',
    title: 'Critical RCE Vulnerability in Apache Log4j',
    content: 'A critical remote code execution vulnerability (CVE-2021-44228) has been discovered in Apache Log4j, affecting millions of systems worldwide. The vulnerability allows attackers to execute arbitrary code through specially crafted log messages.',
    sourceUrl: 'https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44228',
    tags: ['cve', 'rce', 'vulnerability', 'apache'],
    publishedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'New APT Group Targeting Financial Institutions',
    content: 'Security researchers have identified a new advanced persistent threat (APT) group targeting financial institutions across Asia and Europe. The group uses sophisticated social engineering techniques and custom malware.',
    sourceUrl: 'https://security-research.example.com/apt-financial',
    tags: ['apt', 'malware', 'social-engineering', 'breach'],
    publishedAt: '2024-01-14T15:30:00Z',
  },
  {
    id: '3',
    title: 'Zero-Day Exploit in Windows Print Spooler',
    content: 'A zero-day vulnerability has been discovered in the Windows Print Spooler service that could allow local privilege escalation. Microsoft has released an emergency patch to address this critical security issue.',
    sourceUrl: 'https://msrc.microsoft.com/update-guide/vulnerability/CVE-2024-1234',
    tags: ['zero-day', 'windows', 'privilege-escalation', 'vulnerability'],
    publishedAt: '2024-01-13T09:15:00Z',
  },
  {
    id: '4',
    title: 'Ransomware Attack on Healthcare Provider',
    content: 'A major healthcare provider has been hit by a ransomware attack, affecting patient data and hospital operations. The attackers are demanding $5 million in cryptocurrency for the decryption key.',
    sourceUrl: 'https://healthcare-security.example.com/ransomware-attack',
    tags: ['ransomware', 'healthcare', 'breach', 'malware'],
    publishedAt: '2024-01-12T14:45:00Z',
  },
  {
    id: '5',
    title: 'Phishing Campaign Targeting Remote Workers',
    content: 'A sophisticated phishing campaign is targeting remote workers with fake Microsoft Teams notifications. The campaign uses social engineering to steal credentials and gain access to corporate networks.',
    sourceUrl: 'https://security-blog.example.com/phishing-remote-workers',
    tags: ['phishing', 'social-engineering', 'remote-work', 'credentials'],
    publishedAt: '2024-01-11T11:20:00Z',
  },
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(mockJournalEntries)
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 