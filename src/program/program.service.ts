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
          logo: `${process.env.URL}/${file1}`,
          examples: `${process.env.URL}/${file2} ${process.env.URL}/${file3} ${process.env.URL}/${file4}`,
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

  async addAndRemove(programmID, userID) {
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
      const updatedPrograms = user.programs.filter(
        (program) => program != Number(programmID),
      );
      await this.prisma.user.update({
        where: { id: Number(userID) },
        data: { programs: updatedPrograms },
      });
      return user;
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
        systems: program.systems.split(' '),
        description: program.description,
        logo: program.logo,
      };
    });
    return selectedPrograms;
  }

  async showProgram(name) {
    const program = await this.prisma.program.findMany({
      where: { name: { startsWith: name[0].toUpperCase() + name.slice(1) } },
      take: 1,
    });
    return program.map((program) => this.toList(program));
  }

  async sortBySystemAndName(name) {
    const programs = await this.prisma.program.findMany({
      where: {
        systems: {
          contains: name[0].toUpperCase() + name.slice(1),
          mode: 'insensitive',
        },
        name: { contains: name, mode: 'insensitive' },
      },
    });
    const selectedPrograms = programs.map((program) => {
      return {
        id: program.id,
        name: program.name,
        systems: program.systems.split(' '),
        description: program.description,
        logo: program.logo,
      };
    });
    return selectedPrograms;
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
        systems: program.systems.split(' '),
        description: program.description,
        logo: program.logo,
      };
    });
    return selectedPrograms;
  }

  async showAllLikedPrograms(userId) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    this.checkUser(user);

    const allPrograms = await this.prisma.program.findMany();
    const userPrograms = user.programs;
    const selectedPrograms = allPrograms.map((program) => {
      return {
        id: program.id,
        name: program.name,
        systems: program.systems.split(' '),
        description: program.description,
        logo: program.logo,
      };
    });
    const updatedPrograms = selectedPrograms.map((program) => {
      const isFavorite = userPrograms.some(
        (userPrograms) => userPrograms === program.id,
      );
      return { ...program, favorite: isFavorite };
    });
    return updatedPrograms;
  }

  async showLikedByName(text, userId) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    this.checkUser(user);

    text = text.split(' ');
    const needCount = text.length;
    const allPrograms = await this.prisma.program.findMany();
    const userPrograms = user.programs;
    const filteredPrograms = [];
    for (const program of allPrograms) {
      let count = 0;
      for (const word of text) {
        if (
          program &&
          program.name.toLowerCase().includes(word.toLowerCase())
        ) {
          count += 1;
          if (count == needCount) {
            filteredPrograms.push(program);
          }
        }
      }
    }
    const selectedPrograms = filteredPrograms.map((program) => {
      return {
        id: program.id,
        name: program.name,
        systems: program.systems.split(' '),
        description: program.description,
        logo: program.logo,
      };
    });
    const updatedPrograms = selectedPrograms.map((program) => {
      const isFavorite = userPrograms.some(
        (userBrushes) => userBrushes === program.id,
      );
      return { ...program, favorite: isFavorite };
    });
    if (updatedPrograms.length === 0) {
      throw new HttpException('Программа не найдена', HttpStatus.NOT_FOUND);
    } else {
      return updatedPrograms;
    }
  }

  async showLikedBySystem(system, userId) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    this.checkUser(user);

    const allPrograms = await this.prisma.program.findMany({
      where: {
        systems: {
          contains: system[0].toUpperCase() + system.slice(1),
          mode: 'insensitive',
        },
      },
    });
    if (allPrograms.length === 0) {
      throw new HttpException(
        'Программа с такой системой не найдена',
        HttpStatus.NOT_FOUND,
      );
    }
    const userPrograms = user.programs;
    const selectedPrograms = allPrograms.map((program) => {
      return {
        id: program.id,
        name: program.name,
        systems: program.systems.split(' '),
        description: program.description,
        logo: program.logo,
      };
    });
    const updatedPrograms = selectedPrograms.map((program) => {
      const isFavorite = userPrograms.some(
        (userBrushes) => userBrushes === program.id,
      );
      if (program.systems.includes(system[0].toUpperCase() + system.slice(1))) {
        return { ...program, favorite: isFavorite };
      }
    });
    if (updatedPrograms.length === 0) {
      throw new HttpException('Программа не найдена', HttpStatus.NOT_FOUND);
    } else {
      return updatedPrograms;
    }
  }

  async showLikedByNameAndSystem(system, text, userId) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    this.checkUser(user);

    const allPrograms = await this.prisma.program.findMany({
      where: {
        systems: {
          contains: system[0].toUpperCase() + system.slice(1),
          mode: 'insensitive',
        },
      },
    });
    if (allPrograms.length === 0) {
      throw new HttpException(
        'Кисть с такой программой не найдена',
        HttpStatus.NOT_FOUND,
      );
    }

    text = text.split(' ');
    const needCount = text.length;
    const userPrograms = user.programs;
    const filteredPrograms = [];
    for (const program of allPrograms) {
      let count = 0;
      for (const word of text) {
        if (
          program &&
          program.name.toLowerCase().includes(word.toLowerCase())
        ) {
          count += 1;
          if (count == needCount) {
            filteredPrograms.push(program);
          }
        }
      }
    }
    const selectedPrograms = filteredPrograms.map((program) => {
      return {
        id: program.id,
        name: program.name,
        systems: program.systems.split(' '),
        description: program.description,
        logo: program.logo,
      };
    });
    const updatedPrograms = selectedPrograms.map((program) => {
      const isFavorite = userPrograms.some(
        (userBrushes) => userBrushes === program.id,
      );
      if (program.systems.includes(system[0].toUpperCase() + system.slice(1))) {
        return { ...program, favorite: isFavorite };
      }
    });
    if (updatedPrograms.length === 0) {
      throw new HttpException('Кисть не найдена', HttpStatus.NOT_FOUND);
    } else {
      return updatedPrograms;
    }
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
      pluses: program.pluses.split(/\r\n|\n|\r/).filter((item) => item !== ''),
      minuses: program.minuses
        .split(/\r\n|\n|\r/)
        .filter((item) => item !== ''),
      examples: program.examples.split(' '),
      logo: program.logo,
    };
  }
}
