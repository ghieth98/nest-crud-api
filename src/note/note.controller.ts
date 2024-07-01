import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { NoteService } from './note.service';
import { GetUser } from '../auth/decorator';
import { CreateNoteDto, EditNoteDto } from './dto';

@UseGuards(JwtGuard)
@Controller('notes')
export class NoteController {
  constructor(private noteService: NoteService) {
  }

  @Get()
  index(@GetUser('id') userId: number) {
    return this.noteService.index(userId);
  }

  @Post()
  store(@GetUser('id') userId: number, @Body() dto: CreateNoteDto) {
    return this.noteService.store(userId, dto);
  }

  @Get(':id')
  show(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) noteId: number,
  ) {
    return this.noteService.show(userId, noteId);
  }

  @Patch(':id')
  update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) noteId: number,
    @Body() dto: EditNoteDto,
  ) {
    return this.noteService.update(userId, noteId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  destroy(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) noteId: number,
  ) {
    return this.noteService.destroy(userId, noteId);
  }
}
