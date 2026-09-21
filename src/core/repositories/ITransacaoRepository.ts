import { Transacao } from "../domain/entities/Transacao";

export interface ITransacaoRepository {
  findAll(): Promise<Transacao[]>;
  findById(id: string): Promise<Transacao | null>;
  create(data: Omit<Transacao, "id" | "created_at">): Promise<Transacao>;
  update(id: string, data: Partial<Transacao>): Promise<Transacao>;
  delete(id: string): Promise<void>;
}
