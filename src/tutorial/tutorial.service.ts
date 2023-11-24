import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { TutorialDto } from './dto/tutorial.dto';

@Injectable()
export class TutorialService {
  constructor(
    private prisma: PrismaService,
    private fileService: FilesService,
  ) {}

  async createTutorial(dto: TutorialDto, image: any) {
    const allTutorials = await this.prisma.tutorial.findMany();
    const hasDuplicate = allTutorials.some(
      (tutorial) => tutorial.title === dto.title || tutorial.link === dto.link,
    );

    if (!hasDuplicate) {
      const fileName = await this.fileService.createFile(image);
      const newTutorial = await this.prisma.tutorial.create({
        data: { ...dto, image: `http://localhost:7000/${fileName}` },
      });
      return newTutorial;
    } else {
      throw new HttpException(
        'Уже существует туториал с таким названием или ссылкой',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async addToUser(tutorialID, userID) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userID,
        refreshToken: {
          not: null,
        },
      },
    });
    this.checkUser(user);
    if (!user.tutorials.includes(Number(tutorialID))) {
      const allTutorials = await this.prisma.tutorial.findMany();
      for (const tutorial of allTutorials) {
        if (Number(tutorialID) == Number(tutorial.id)) {
          await this.prisma.user.update({
            data: { tutorials: { push: Number(tutorialID) } },
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

  async removeFromUser(tutorialID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user);
    delete user.tutorials[tutorialID];
    return user;
  }

  async showAllTutorials(page, size) {
    const allTutorials = await this.prisma.tutorial.findMany();
    const cutAllTutorials = await this.prisma.tutorial.findMany({
      skip: (page - 1) * size,
      take: Number(size),
    });
    return { ...cutAllTutorials, totalCount: allTutorials.length };
  }

  async showTutorialByID(tutorialID) {
    const tutorial = await this.prisma.tutorial.findUnique({
      where: { id: parseInt(tutorialID) },
    });
    if (tutorial) {
      return tutorial;
    } else {
      throw new HttpException('Туториал не найден', HttpStatus.NOT_FOUND);
    }
  }

  async sortByProgram(program, page, size) {
    const allPrograms = await this.prisma.tutorial.findMany({
      where: { program: program },
    });
    if (allPrograms.length === 0) {
      throw new HttpException(
        'Туториал с такой программой не найден',
        HttpStatus.NOT_FOUND,
      );
    }
    const startIndex = (page - 1) * size;
    const endIndex = page * size;
    const paginatedTutorials = allPrograms.slice(startIndex, endIndex);
    return { ...paginatedTutorials, totalCount: allPrograms.length };
  }

  async sortByName(text, page, size) {
    text = text.split(' ');
    const needCount = text.length;
    const allTutorials = await this.prisma.tutorial.findMany();
    const filteredTutorials = [];
    for (const tutorial of allTutorials) {
      let count = 0;
      for (const word of text) {
        if (tutorial && tutorial.title.includes(word)) {
          count += 1;
          if (count == needCount) {
            filteredTutorials.push(tutorial);
          }
        }
      }
    }
    if (filteredTutorials.length === 0) {
      throw new HttpException('Туториал не найден', HttpStatus.NOT_FOUND);
    } else {
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedTutorials = allTutorials.slice(startIndex, endIndex);
      return { ...paginatedTutorials, totalCount: allTutorials.length };
    }
  }

  checkUser(user) {
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
  }
}
