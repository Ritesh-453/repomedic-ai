import './globals.css'

export const metadata = {
  title: 'RepoMedic AI — Debug Any Repository',
  description: 'AI-powered bug diagnosis using IBM BOB + Groq. Understand, diagnose, and fix software bugs instantly.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
