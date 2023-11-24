import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return await this.prisma.user.findMany();
  }

  async getUser(userId) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        refreshToken: {
          not: null,
        },
      },
    });
    this.checkUser(user);
    return user;
  }

  async deleteUser(userId) {
    const user = await this.prisma.user.delete({
      where: { id: parseInt(userId) },
    });
    this.checkUser(user);
    return user;
  }

  async sortBrushByProgramm(program, userID) {
    const allPrograms = await this.prisma.program.findMany({
      where: { name: program },
    });
    if (allPrograms.length === 0) {
      throw new HttpException('Программа не найдена', HttpStatus.NOT_FOUND);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user);
    const filteredBrushes = [];
    const userBrushes = [];
    for (const id of user.brushes) {
      userBrushes.push(
        await this.prisma.brush.findUnique({ where: { id: id } }),
      );
    }
    for (const brush of userBrushes) {
      if (brush) {
        if (brush.programm == program) {
          filteredBrushes.push(brush);
        }
      }
    }
    if (filteredBrushes.length === 0) {
      throw new HttpException(
        'Нет кистей с такой программой',
        HttpStatus.NOT_FOUND,
      );
    } else {
      return filteredBrushes;
    }
  }

  async sortReferenceByHashtag(hashtag, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user);

    const userReferences = [];
    for (const id of user.references) {
      userReferences.push(
        await this.prisma.reference.findUnique({ where: { id: id } }),
      );
    }

    const filteredReferences = [];
    for (const reference of userReferences) {
      if (reference) {
        const text = reference.hashtag.split('#');
        for (const word of text) {
          if (word.trim() == hashtag) {
            filteredReferences.push(reference);
          }
        }
      }
    }
    if (filteredReferences.length === 0) {
      throw new HttpException(
        'У референсов не таких хэштэгов',
        HttpStatus.NOT_FOUND,
      );
    } else {
      return filteredReferences;
    }
  }

  async sortReferenceByTitle(text, userID) {
    text = text.split(' ');
    const needCount = text.length;
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user);

    const userReferences = [];
    for (const id of user.references) {
      userReferences.push(
        await this.prisma.reference.findUnique({ where: { id: id } }),
      );
    }
    const filteredReferences = [];
    for (const reference of userReferences) {
      let count = 0;
      for (const word of text) {
        if (reference && reference.title.includes(word)) {
          count += 1;
          if (count == needCount) {
            filteredReferences.push(reference);
          }
        }
      }
    }
    if (filteredReferences.length === 0) {
      throw new HttpException(
        'Референс с таким названием не найден',
        HttpStatus.NOT_FOUND,
      );
    } else {
      return filteredReferences;
    }
  }

  async getUsersBrushes(userID) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userID,
        refreshToken: {
          not: null,
        },
      },
    });
    this.checkUser(user);

    const brushList = await this.prisma.brush.findMany({
      where: { id: { in: user.brushes } },
    });
    return brushList;
  }

  async getUsersReferences(userID) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userID,
        refreshToken: {
          not: null,
        },
      },
    });
    this.checkUser(user);

    const referenceList = await this.prisma.reference.findMany({
      where: { id: { in: user.references } },
    });
    return referenceList;
  }

  async getUsersTutorials(userID) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userID,
        refreshToken: {
          not: null,
        },
      },
    });
    this.checkUser(user);

    const tutorialList = await this.prisma.tutorial.findMany({
      where: { id: { in: user.tutorials } },
    });
    return tutorialList;
  }

  async getUsersPrograms(userID) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userID,
        refreshToken: {
          not: null,
        },
      },
    });
    this.checkUser(user);

    const programList = await this.prisma.program.findMany({
      where: { id: { in: user.programs } },
    });
    return programList;
  }

  checkUser(user) {
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
  }
}
