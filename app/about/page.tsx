'use client'

import { Shield, Users, Code, BookOpen, FileText, Heart, Github, Twitter, Linkedin } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="bg-dark-900/50 border-b border-red-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold neon-glow mb-4">About SudoSoc</h1>
          <p className="text-gray-400 text-lg">
            Empowering the cybersecurity community with tools, knowledge, and collaboration.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
              <Shield className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Security First</h3>
              <p className="text-gray-300">
                We believe in making cybersecurity tools and knowledge accessible to everyone. 
                Our platform serves as a hub for security professionals, researchers, and enthusiasts.
              </p>
            </div>
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
              <Users className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Community Driven</h3>
              <p className="text-gray-300">
                Built by the community, for the community. We encourage contributions, 
                knowledge sharing, and collaboration among security professionals worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 text-center">
              <Code className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Security Tools</h3>
              <p className="text-gray-300 text-sm">
                Discover and rate the latest cybersecurity tools used by professionals.
              </p>
            </div>
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 text-center">
              <Code className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Scripts Library</h3>
              <p className="text-gray-300 text-sm">
                Access and contribute to a growing collection of security scripts.
              </p>
            </div>
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 text-center">
              <BookOpen className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">E-Books</h3>
              <p className="text-gray-300 text-sm">
                Download free cybersecurity e-books covering various security topics.
              </p>
            </div>
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 text-center">
              <FileText className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Security Journal</h3>
              <p className="text-gray-300 text-sm">
                Stay updated with curated CVE reports and security research.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 text-center">
              <div className="w-24 h-24 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Security Researchers</h3>
              <p className="text-gray-300 text-sm">
                Our team of security researchers curates content and ensures quality.
              </p>
            </div>
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 text-center">
              <div className="w-24 h-24 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Code className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Developers</h3>
              <p className="text-gray-300 text-sm">
                Building and maintaining the platform with security best practices.
              </p>
            </div>
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 text-center">
              <div className="w-24 h-24 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
              <p className="text-gray-300 text-sm">
                You! The cybersecurity community that makes this platform valuable.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold">Open Source</h4>
                  <p className="text-gray-300 text-sm">We believe in transparency and community collaboration.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold">Education</h4>
                  <p className="text-gray-300 text-sm">Making cybersecurity knowledge accessible to everyone.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold">Innovation</h4>
                  <p className="text-gray-300 text-sm">Constantly evolving with the latest security trends.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold">Privacy</h4>
                  <p className="text-gray-300 text-sm">Your data and contributions are protected and secure.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold">Quality</h4>
                  <p className="text-gray-300 text-sm">Curated content that meets professional standards.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold">Community</h4>
                  <p className="text-gray-300 text-sm">Building a supportive and inclusive security community.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Contact Us</h3>
              <div className="space-y-3">
                <p className="text-gray-300">
                  <span className="text-red-500">Email:</span> contact@sudosoc.com
                </p>
                <p className="text-gray-300">
                  <span className="text-red-500">Support:</span> support@sudosoc.com
                </p>
                <p className="text-gray-300">
                  <span className="text-red-500">Security:</span> security@sudosoc.com
                </p>
              </div>
            </div>
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="text-gray-300">Made with love for the cybersecurity community</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 SudoSoc. All rights reserved.
          </p>
        </section>
      </div>
    </div>
  )
} 