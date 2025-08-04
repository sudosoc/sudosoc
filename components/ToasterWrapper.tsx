'use client'

import { Toaster } from 'react-hot-toast'

export default function ToasterWrapper() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #ff0000',
        },
      }}
    />
  )
} 