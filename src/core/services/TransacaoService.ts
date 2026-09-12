import { ITransacaoRepository } from "../repositories/ITransacaoRepository";
import { Transacao } from "../domain/entities/Transacao";
import { PrismaTransacaoRepository } from "../../infrastructure/repositories/PrismaTransacaoRepository";

export class TransacaoService {
  private repository: ITransacaoRepository;

  constructor(repository?: ITransacaoRepository) {
    this.repository = repository || new PrismaTransacaoRepository();
  }

  async getAllTransacoes(): Promise<Transacao[]> {
    return this.repository.findAll();
  }

  async getTransacaoById(id: string): Promise<Transacao | null> {
    if (!id) throw new Error("ID da transação é obrigatório.");
    return this.repository.findById(id);
  }

  async createTransacao(data: Omit<Transacao, "id" | "created_at">): Promise<Transacao> {
    return this.repository.create(data);
  }

  async updateTransacao(id: string, data: Partial<Transacao>): Promise<Transacao> {
    if (!id) throw new Error("ID da transação é obrigatório.");
    return this.repository.update(id, data);
  }

  async deleteTransacao(id: string): Promise<void> {
    if (!id) throw new Error("ID da transação é obrigatório.");
    return this.repository.delete(id);
  }
}
