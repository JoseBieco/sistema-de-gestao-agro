import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.cotacaoHistorica.deleteMany({
    where: { valor: 0 }
  })
  console.log(`Deletados ${result.count} registros com valor 0.`)
}

main()
