"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Beef,
  Syringe,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  ClipboardList,
  ShoppingCart,
  Receipt,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: number
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navigation: NavGroup[] = [
  {
    title: "Principal",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Rebanho",
    items: [
      { title: "Animais", href: "/animais", icon: Beef },
      { title: "Raças", href: "/racas", icon: ClipboardList },
    ],
  },
  {
    title: "Sanitário",
    items: [
      { title: "Vacinas", href: "/vacinas", icon: Syringe },
      { title: "Agenda", href: "/agenda", icon: Calendar },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { title: "Compras", href: "/compras", icon: ShoppingCart },
      { title: "Vendas", href: "/vendas", icon: TrendingUp },
      { title: "Parcelas", href: "/parcelas", icon: Receipt },
      { title: "Parceiros", href: "/parceiros", icon: Users },
    ],
  },
  {
    title: "Sistema",
    items: [
      { title: "Relatórios", href: "/relatorios", icon: FileText },
      { title: "Configurações", href: "/configuracoes", icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col",
        collapsed ? "w-[70px]" : "w-[260px]",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Beef className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">Gestão</span>
              <span className="text-xs text-sidebar-foreground/70 leading-tight">Pecuária 360</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary mx-auto">
            <Beef className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navigation.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <h4 className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
                  {group.title}
                </h4>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse Button */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
