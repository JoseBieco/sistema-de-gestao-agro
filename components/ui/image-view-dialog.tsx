"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface ImageViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  title?: string;
}

export function ImageViewDialog({
  open,
  onOpenChange,
  url,
  title = "Visualizar Documento",
}: ImageViewDialogProps) {
  if (!url) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-4">
        <DialogHeader className="px-1">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative flex-1 w-full h-full bg-black/5 rounded-md overflow-hidden border">
          <Image
            src={url}
            alt="Documento"
            fill
            className="object-contain"
            unoptimized // Importante para imagens externas/storage
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
