"use server"

import { AnimalService } from "@/src/core/services/AnimalService";
import { revalidatePath } from "next/cache";

const animalService = new AnimalService();

export async function getAnimais() {
  return await animalService.getAllAnimais();
}

export async function getAnimal(id: string) {
  return await animalService.getAnimalById(id);
}

export async function getAnimalDetailed(id: string) {
  return await animalService.getAnimalByIdDetailed(id);
}

export async function createAnimal(data: any) {
  const result = await animalService.createAnimal(data);
  revalidatePath("/animais");
  return result;
}

export async function updateAnimal(id: string, data: any) {
  const result = await animalService.updateAnimal(id, data);
  revalidatePath("/animais");
  revalidatePath(`/animais/${id}`);
  return result;
}

export async function deleteAnimal(id: string) {
  await animalService.deleteAnimal(id);
  revalidatePath("/animais");
}

export async function addAnimalWeight(payload: {
  animal_id: string;
  peso: number;
  data_pesagem: string;
  observacoes: string;
}) {
  const { prisma } = await import("@/lib/prisma");

  await prisma.$transaction(async (tx) => {
    await tx.historicoPesagem.create({
      data: {
        animal_id: payload.animal_id,
        peso: payload.peso,
        data_pesagem: new Date(payload.data_pesagem),
        observacoes: payload.observacoes,
      },
    });

    await tx.animal.update({
      where: { id: payload.animal_id },
      data: { peso_atual: payload.peso },
    });
  });

  revalidatePath(`/animais/${payload.animal_id}`);
  revalidatePath("/animais");
  return { success: true };
}
