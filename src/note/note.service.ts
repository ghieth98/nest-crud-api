import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto, EditNoteDto } from './dto';

@Injectable()
export class NoteService {
  constructor(private prisma: PrismaService) {}

  async index(userId: number) {
    return this.prisma.note.findMany({
      where: { userId },
    });
  }

  async store(userId: number, dto: CreateNoteDto) {
    return this.prisma.note.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async show(userId: number, noteId: number) {
    return this.prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
    });
  }

  async update(userId: number, noteId: number, dto: EditNoteDto) {
    //   Get the note by the id
    const note = await this.prisma.note.findUnique({
      where: {
        id: noteId,
      },
    });
    //   check if the note belongs to the user
    if (!note || note.userId !== userId) throw new UnauthorizedException();
    //   update the note
    return this.prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        ...dto,
      },
    });
  }

  async destroy(userId: number, noteId: number) {
    //   Get the note by the id
    const note = await this.prisma.note.findUnique({
      where: {
        id: noteId,
      },
    });
    //   check if the note belongs to the user
    if (!note || note.userId !== userId) throw new UnauthorizedException();
    //   delete the note
    await this.prisma.note.delete({
      where: {
        id: noteId,
        userId,
      },
    });
  }
}
