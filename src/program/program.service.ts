import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { ProgramFullDto } from './dto/fullProgram.dto';

@Injectable()
export class ProgramService {
  constructor(
    private prisma: PrismaService,
    private fileService: FilesService,
  ) {}

  async createProgramm(
    dto: ProgramFullDto,
    logo: any,
    example1: any,
    example2: any,
    example3: any,
  ) {
    const allPrograms = await this.prisma.program.findMany();
    const hasDuplicate = allPrograms.some(
      (program) => program.name === dto.name || program.link === dto.link,
    );
    if (!hasDuplicate) {
      const file1 = await this.fileService.createFile(logo);
      const file2 = await this.fileService.createFile(example1);
      const file3 = await this.fileService.createFile(example2);
      const file4 = await this.fileService.createFile(example3);
      const newProgram = await this.prisma.program.create({
        data: {
          ...dto,
          logo: `http://localhost:7000/${file1}`,
          examples: `http://localhost:7000/${file2} http://localhost:7000/${file3} http://localhost:7000/${file4}`,
        },
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
      where: {
        id: userID,
        refreshToken: {
          not: null,
        },
      },
    });
    this.checkUser(user);
    if (!user.programs.includes(Number(programmID))) {
      const allPrograms = await this.prisma.program.findMany();
      for (const program of allPrograms) {
        if (Number(programmID) == Number(program.id)) {
          await this.prisma.user.update({
            data: { programs: { push: Number(programmID) } },
            where: { id: Number(userID) },
          });
          return user;
        }
      }
      throw new HttpException('Программа не найдена', HttpStatus.NOT_FOUND);
    } else {
      throw new HttpException('Программа уже добавлена', HttpStatus.FORBIDDEN);
    }
  }

  async removeFromUser(programmID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user);
    delete user.programs[programmID];
    return user;
  }

  async showAllPrograms() {
    const allPrograms = await this.prisma.program.findMany();
    const selectedPrograms = allPrograms.map((program) => {
      return {
        id: program.id,
        name: program.name,
        link: program.link,
        systems: program.systems.split(' '),
        description: program.description,
        logo: program.logo,
      };
    });
    return selectedPrograms;
  }

  async showProgram(name) {
    const program = await this.prisma.program.findUnique({
      where: { name: name[0].toUpperCase() + name.slice(1) },
    });
    return this.toList(program);
  }

  async sortBySystem(name) {
    const programs = await this.prisma.program.findMany({
      where: {
        systems: {
          contains: name[0].toUpperCase() + name.slice(1),
          mode: 'insensitive',
        },
      },
    });
    const selectedPrograms = programs.map((program) => {
      return {
        id: program.id,
        name: program.name,
        link: program.link,
        systems: program.systems.split(' '),
        description: program.description,
        logo: program.logo,
      };
    });
    return selectedPrograms;
  }

  async sortByName(name) {
    const programs = await this.prisma.program.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
    });
    const selectedPrograms = programs.map((program) => {
      return {
        id: program.id,
        name: program.name,
        link: program.link,
        systems: program.systems.split(' '),
        description: program.description,
        logo: program.logo,
      };
    });
    return selectedPrograms;
  }

  checkUser(user) {
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
  }

  toList(program) {
    return {
      id: program.id,
      name: program.name,
      link: program.link,
      systems: program.systems.split(' '),
      description: program.description,
      pluses: program.pluses.split('###'),
      minuses: program.pluses.split('###'),
      examples: program.examples.split(' '),
      logo: program.logo,
    };
  }
}
