import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/User.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return await this.prisma.user.findMany();
  }

  async getUser(userId) {
    let user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    this.checkUser(user);
    return user;
  }

  async deleteUser(userId) {
    let user = await this.prisma.user.delete({
      where: { id: parseInt(userId) },
    });
    this.checkUser(user);
    return user;
  }

  async sortBrushByProgramm(program, userID) {
    const allPrograms = await this.prisma.programm.findMany();
    const flag = allPrograms.find((x) => x.name === program);
    if (flag) {
      const user = await this.prisma.user.findUnique({
        where: { id: Number(userID) },
      });
      this.checkUser(user);
      let filteredBrushes = [];
      let userBrushes = [];
      for (let id of user.brushes) {
        userBrushes.push(
          await this.prisma.brush.findUnique({ where: { id: id } }),
        );
      }
      for (let brush of userBrushes) {
        if (brush) {
          if (brush.programm == program) {
            filteredBrushes.push(brush);
          }
        }
      }
      if (filteredBrushes.length === 0) {
        throw new HttpException(
          'Нет таких программ',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        return filteredBrushes;
      }
    } else {
      throw new HttpException(
        'Такой программы нет',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sortReferenceByHashtag(hashtag, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user);

    let userReferences = [];
    for (let id of user.references) {
      userReferences.push(
        await this.prisma.reference.findUnique({ where: { id: id } }),
      );
    }

    let filteredReferences = [];
    for (let reference of userReferences) {
      if (reference) {
        let text = reference.hashtag.split('#');
        for (let word of text) {
          if (word.trim() == hashtag) {
            filteredReferences.push(reference);
          }
        }
      }
    }
    if (filteredReferences.length === 0) {
      throw new HttpException(
        'Нет таких хэштэгов',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      return filteredReferences;
    }
  }

  async sortReferenceByTitle(text, userID) {
    text = text.split(' ');
    let needCount = text.length;
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user);

    let userReferences = [];
    for (let id of user.references) {
      userReferences.push(
        await this.prisma.reference.findUnique({ where: { id: id } }),
      );
    }
    let filteredReferences = [];
    for (let reference of userReferences) {
      let count = 0;
      for (let word of text) {
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
        'Нет таких названий референсов',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      return filteredReferences;
    }
  }

  checkUser(user) {
    if (!user) {
      throw new HttpException(
        'Такого юзера нет',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
