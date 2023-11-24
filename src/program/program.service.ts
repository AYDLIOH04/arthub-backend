import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { ProgramDto } from './dto/program.dto';

@Injectable()
export class ProgramService {
  constructor(
    private prisma: PrismaService,
    private fileService: FilesService,
  ) {}

  async createProgramm(dto: ProgramDto, logo: any) {
    const allPrograms = await this.prisma.programm.findMany();
    const hasDuplicate = allPrograms.some(
        program => program.name === dto.name || program.link === dto.link
    );
    if (!hasDuplicate) {
      const fileName = await this.fileService.createFile(logo);
      const newProgram = await this.prisma.programm.create({
        data: { ...dto, logo: `http://localhost:7000/${fileName}` },
      });
      return newProgram;
    } else {
      throw new HttpException(
          'Уже существует программа с таким названием или ссылкой',
          HttpStatus.FORBIDDEN,
      );
    }
  }

  async addToUser(programmID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user);
    user.programm.push(programmID);
    return user;
  }

  async removeFromUser(programmID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user);
    delete user.programm[programmID];
    return user;
  }

  async showAllPrograms() {
    const allPrograms = await this.prisma.programm.findMany();
    return allPrograms;
  }

  checkUser(user) {
    if (!user) {
      throw new HttpException(
          'Пользователь не найден',
          HttpStatus.NOT_FOUND,
      );
    }
  }
}
