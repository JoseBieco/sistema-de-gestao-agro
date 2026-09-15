"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
  title?: string
}

const COLLAPSED_STORAGE_KEY = "sidebar:collapsed"

export function AppShell({ children, title }: AppShellProps) {
  // Fica falso até a hidratação ler o valor salvo, para o primeiro render do
  // servidor e do cliente baterem (evita mismatch de hidratação).
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLLAPSED_STORAGE_KEY)
      if (stored !== null) setCollapsed(stored === "true")
    } catch {
      // localStorage indisponível — segue com o padrão (expandida).
    }
  }, [])

  const handleCollapsedChange = (value: boolean) => {
    setCollapsed(value)
    try {
      window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(value))
    } catch {
      // ok seguir sem persistir
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onCollapsedChange={handleCollapsedChange} />
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "pl-[70px]" : "pl-[260px]"
        )}
      >
        <Header title={title} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
