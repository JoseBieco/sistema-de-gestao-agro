"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"

interface FinancialData {
  receitas: number
  despesas: number
  saldo: number
  aReceber: number
  aPagar: number
}

const financialData: FinancialData = {
  receitas: 125000,
  despesas: 45000,
  saldo: 80000,
  aReceber: 35000,
  aPagar: 12000,
}

export function FinancialSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Resumo Financeiro</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Main Balance */}
          <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo do Período</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(financialData.saldo)}</p>
              </div>
            </div>
          </div>

          {/* Income and Expenses */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-emerald-500/10 p-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm text-muted-foreground">Receitas</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-emerald-600">{formatCurrency(financialData.receitas)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-red-500/10 p-1.5">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm text-muted-foreground">Despesas</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-red-600">{formatCurrency(financialData.despesas)}</p>
            </div>
          </div>

          {/* Pending */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">A Receber</p>
              <p className="mt-1 text-base font-medium text-emerald-600">{formatCurrency(financialData.aReceber)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">A Pagar</p>
              <p className="mt-1 text-base font-medium text-red-600">{formatCurrency(financialData.aPagar)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
