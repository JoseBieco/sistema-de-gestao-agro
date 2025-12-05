"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface AppShellProps {
  children: React.ReactNode
  title?: string
}

export function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-[260px] transition-all duration-300">
        <Header title={title} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
