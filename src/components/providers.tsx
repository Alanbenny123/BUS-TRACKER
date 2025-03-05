import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

export default function Providers({
 children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}