import './globals.css'
import { Poppins } from 'next/font/google'

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '700', '800'],
  variable: '--font-poppins'
})

export const metadata = {
  title: 'RepoMedic AI — Debug Any Repository',
  description: 'AI-powered bug diagnosis using IBM BOB + Groq. Understand, diagnose, and fix software bugs instantly.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  )
}