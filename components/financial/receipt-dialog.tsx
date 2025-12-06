"use client";

import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Parcela, Transacao, Parceiro } from "@/lib/types/database";

// Definição do tipo estendido necessário para o recibo
type ParcelaExtended = Parcela & {
  transacao?: Transacao & {
    parceiro?: Parceiro;
  };
};

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parcela: ParcelaExtended | null;
}

export function ReceiptDialog({
  open,
  onOpenChange,
  parcela,
}: ReceiptDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!parcela) return null;

  const handlePrint = () => {
    if (!printRef.current) return;

    // Cria uma janela popup para impressão
    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");

    if (printWindow) {
      printWindow.document.write(
        "<html><head><title>Recibo de Pagamento</title>"
      );
      // Adicionamos estilos básicos para impressão
      printWindow.document.write(`
        <style>
          body { font-family: 'Arial', sans-serif; padding: 40px; color: #000; }
          .receipt-container { border: 2px solid #000; padding: 30px; position: relative; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
          .subtitle { font-size: 14px; margin-top: 5px; }
          .row { margin-bottom: 15px; display: flex; align-items: baseline; }
          .label { font-weight: bold; margin-right: 10px; min-width: 100px; }
          .value { border-bottom: 1px dotted #000; flex: 1; padding-bottom: 2px; }
          .amount { font-size: 20px; font-weight: bold; border: 1px solid #000; padding: 5px 15px; background: #f0f0f0; display: inline-block; }
          .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
          .signature { border-top: 1px solid #000; width: 45%; text-align: center; padding-top: 10px; }
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; opacity: 0.1; pointer-events: none; text-transform: uppercase; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      `);
      printWindow.document.write("</head><body>");
      printWindow.document.write(content);
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.focus();
      // Pequeno delay para garantir carregamento dos estilos
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  // Dados para exibição
  const nomePagador =
    parcela.transacao?.parceiro?.nome ||
    "................................................";
  const documentoPagador = parcela.transacao?.parceiro?.documento || "";
  const dataPagamento = parcela.data_pagamento
    ? formatDate(parcela.data_pagamento)
    : formatDate(new Date().toISOString());
  const valorFormatado = formatCurrency(parcela.valor);
  const referente = `Pagamento da parcela ${
    parcela.numero_parcela
  } referente à ${
    parcela.transacao?.tipo === "venda" ? "Compra" : "Venda"
  } de animais.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Imprimir Comprovante</DialogTitle>
        </DialogHeader>

        {/* Área de Visualização (Preview) */}
        <div className="border rounded-lg p-4 bg-gray-50 overflow-hidden">
          <div
            ref={printRef}
            className="bg-white p-8 text-black shadow-sm receipt-container"
          >
            {/* Marca d'água de PAGO se já estiver pago */}
            {parcela.status === "pago" && <div className="watermark">PAGO</div>}

            <div className="header">
              <div className="title">RECIBO DE PAGAMENTO</div>
              <div className="subtitle">
                Nº Controle: {parcela.id.slice(0, 8).toUpperCase()}
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <div className="amount">{valorFormatado}</div>
              <div>Data: {dataPagamento}</div>
            </div>

            <div className="content space-y-6 text-lg leading-relaxed">
              <p>
                Recebemos de <strong>{nomePagador}</strong>
                {documentoPagador && (
                  <span> (CPF/CNPJ: {documentoPagador})</span>
                )}
                , a importância supra de <strong>{valorFormatado}</strong>.
              </p>

              <p>
                Referente a: <br />
                <span className="italic">{referente}</span>
              </p>

              <p>
                Para clareza e firmeza do presente, firmamos o presente recibo
                dando plena e geral quitação da parcela citada.
              </p>
            </div>

            <div className="footer">
              <div className="text-sm">
                Local: _______________________, ____/____/______
              </div>
              <div className="signature">
                <strong>Assinatura do Recebedor</strong>
                <br />
                <span className="text-sm">Gestão Pecuária 360</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Recibo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
