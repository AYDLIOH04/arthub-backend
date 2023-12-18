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
        data: { ...dto, image: `${process.env.URL}/${fileName}` },
      });
      return newTutorial;
    } else {
      throw new HttpException(
        'Уже существует туториал с таким названием или ссылкой',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async addAndRemove(tutorialID, userID) {
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
      const updatedTutorials = user.tutorials.filter(
        (tutorial) => tutorial != Number(tutorialID),
      );
      await this.prisma.user.update({
        where: { id: Number(userID) },
        data: { tutorials: updatedTutorials },
      });
      return user;
    }
  }

  async showAllLikedTutorials(page, size, userId) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    this.checkUser(user);
    const allTutorials = await this.prisma.tutorial.findMany();
    const userTutorials = user.tutorials;
    const cutAllTutorials = await this.prisma.tutorial.findMany({
      skip: (page - 1) * size,
      take: Number(size),
    });
    const updatedTutorials = cutAllTutorials.map((tutorial) => {
      const isFavorite = userTutorials.some(
        (userTutorials) => userTutorials === tutorial.id,
      );
      return { ...tutorial, favorite: isFavorite };
    });
    return {
      response: updatedTutorials,
      totalCount: allTutorials.length,
    };
  }

  async showAllTutorials(page, size) {
    const allTutorials = await this.prisma.tutorial.findMany();
    const cutAllTutorials = await this.prisma.tutorial.findMany({
      skip: (page - 1) * size,
      take: Number(size),
    });
    return { response: cutAllTutorials, totalCount: allTutorials.length };
  }

  async showLikedTutorialByID(tutorialID, userId) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const tutorial = await this.prisma.tutorial.findUnique({
      where: { id: parseInt(tutorialID) },
    });
    if (tutorial) {
      const isFavorite = user.tutorials.includes(tutorial.id);
      return { ...tutorial, favorite: isFavorite };
    } else {
      throw new HttpException('Туториал не найден', HttpStatus.NOT_FOUND);
    }
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

  async sortByDifficulty(difficulty, page, size) {
    const allPrograms = await this.prisma.tutorial.findMany({
      where: { difficulty: { contains: difficulty, mode: 'insensitive' } },
    });
    if (!allPrograms.length) {
      throw new HttpException(
        'Туториал с такой программой не найден',
        HttpStatus.NOT_FOUND,
      );
    }
    const startIndex = (page - 1) * size;
    const endIndex = page * size;
    const paginatedTutorials = allPrograms.slice(startIndex, endIndex);
    return { response: paginatedTutorials, totalCount: allPrograms.length };
  }

  async sortByName(text, page, size) {
    text = text.split(' ');
    const needCount = text.length;
    const allTutorials = await this.prisma.tutorial.findMany();
    const filteredTutorials = [];
    for (const tutorial of allTutorials) {
      let count = 0;
      for (const word of text) {
        if (
          tutorial &&
          tutorial.title.toLowerCase().includes(word.toLowerCase())
        ) {
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
      const paginatedTutorials = filteredTutorials.slice(startIndex, endIndex);
      return {
        response: paginatedTutorials,
        totalCount: filteredTutorials.length,
      };
    }
  }

  async sortByDifficultyAndName(difficulty, text, page, size) {
    const allPrograms = await this.prisma.tutorial.findMany({
      where: { difficulty: { contains: difficulty, mode: 'insensitive' } },
    });
    if (!allPrograms.length) {
      throw new HttpException(
        'Туториал с такой программой не найден',
        HttpStatus.NOT_FOUND,
      );
    }
    text = text.split(' ');
    const needCount = text.length;
    const filteredTutorials = [];
    for (const tutorial of allPrograms) {
      let count = 0;
      for (const word of text) {
        if (
          tutorial &&
          tutorial.title.toLowerCase().includes(word.toLowerCase())
        ) {
          count += 1;
          if (count == needCount) {
            filteredTutorials.push(tutorial);
          }
        }
      }
    }
    if (!filteredTutorials.length) {
      throw new HttpException('Туториал не найден', HttpStatus.NOT_FOUND);
    } else {
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedTutorials = filteredTutorials.slice(startIndex, endIndex);
      return {
        response: paginatedTutorials,
        totalCount: filteredTutorials.length,
      };
    }
  }

  async showLikedByName(text, page, size, userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    this.checkUser(user);

    text = text.split(' ');
    const needCount = text.length;
    const allTutorials = await this.prisma.tutorial.findMany();
    const userTutorials = user.tutorials;
    const filteredTutorials = [];
    for (const tutorial of allTutorials) {
      let count = 0;
      for (const word of text) {
        if (
          tutorial &&
          tutorial.title.toLowerCase().includes(word.toLowerCase())
        ) {
          count += 1;
          if (count == needCount) {
            filteredTutorials.push(tutorial);
          }
        }
      }
    }
    const updatedTutorials = filteredTutorials.map((tutorial) => {
      const isFavorite = userTutorials.some(
        (userBrushes) => userBrushes === tutorial.id,
      );
      return { ...tutorial, favorite: isFavorite };
    });
    if (!updatedTutorials.length) {
      throw new HttpException('Кисть не найдена', HttpStatus.NOT_FOUND);
    } else {
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedTutorials = updatedTutorials.slice(startIndex, endIndex);
      return {
        response: paginatedTutorials,
        totalCount: filteredTutorials.length,
      };
    }
  }

  async showLikedByDifficulty(difficulty, page, size, userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    this.checkUser(user);

    const allTutorials = await this.prisma.tutorial.findMany({
      where: {
        difficulty: {
          contains: difficulty[0].toUpperCase() + difficulty.slice(1),
          mode: 'insensitive',
        },
      },
    });
    if (!allTutorials.length) {
      throw new HttpException(
        'Кисть с такой программой не найдена',
        HttpStatus.NOT_FOUND,
      );
    }
    const updatedTutorials = allTutorials.map((tutorial) => {
      const isFavorite = user.tutorials.some(
        (userBrushes) => userBrushes === tutorial.id,
      );
      if (tutorial.difficulty.includes(difficulty)) {
        return { ...tutorial, favorite: isFavorite };
      }
    });
    if (!updatedTutorials.length) {
      throw new HttpException('Кисть не найдена', HttpStatus.NOT_FOUND);
    } else {
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedTutorials = updatedTutorials.slice(startIndex, endIndex);
      return { response: paginatedTutorials, totalCount: allTutorials.length };
    }
  }

  async showLikedByNameAndDifficulty(difficulty, text, page, size, userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    this.checkUser(user);

    const allTutorials = await this.prisma.tutorial.findMany({
      where: {
        difficulty: {
          contains: difficulty[0].toUpperCase() + difficulty.slice(1),
          mode: 'insensitive',
        },
      },
    });
    if (!allTutorials.length) {
      throw new HttpException(
        'Кисть с такой программой не найдена',
        HttpStatus.NOT_FOUND,
      );
    }
    text = text.split(' ');
    const filteredTutorials = [];
    for (const tutorial of allTutorials) {
      let count = 0;
      for (const word of text) {
        if (
          tutorial &&
          tutorial.title.toLowerCase().includes(word.toLowerCase())
        ) {
          count += 1;
          if (count == text.length) {
            filteredTutorials.push(tutorial);
          }
        }
      }
    }
    const updatedTutorials = filteredTutorials.map((tutorial) => {
      const isFavorite = user.tutorials.some(
        (userBrushes) => userBrushes === tutorial.id,
      );
      if (tutorial.difficulty.includes(difficulty)) {
        return { ...tutorial, favorite: isFavorite };
      }
    });
    if (!updatedTutorials.length) {
      throw new HttpException('Кисть не найдена', HttpStatus.NOT_FOUND);
    } else {
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedTutorials = updatedTutorials.slice(startIndex, endIndex);
      return {
        response: paginatedTutorials,
        totalCount: filteredTutorials.length,
      };
    }
  }

  checkUser(user) {
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
  }
}
