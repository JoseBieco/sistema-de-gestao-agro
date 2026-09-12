import { prisma } from "./lib/prisma"

async function main() {
  const result = await prisma.cotacaoHistorica.deleteMany({
    where: { valor: 0 }
  })
  console.log(`Deletados ${result.count} registros com valor 0.`)
}

main()
