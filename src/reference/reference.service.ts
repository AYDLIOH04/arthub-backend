import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { ReferenceDto } from './dto/reference.dto';

@Injectable()
export class ReferenceService {
  constructor(
    private prisma: PrismaService,
    private fileService: FilesService,
  ) {}

  async createReference(dto: ReferenceDto, image: any) {
    const allReferences = await this.prisma.reference.findMany();
    let flag = true;
    for (let i = 0; i < allReferences.length; i++) {
      if (dto.title == allReferences[i].title) {
        flag = false;
      }
    }
    if (flag) {
      const fileName = await this.fileService.createFile(image);
      const newReference = await this.prisma.reference.create({
        data: { ...dto, image: `http://localhost:7000/${fileName}` },
      });
      return newReference;
    } else {
      throw new HttpException(
        'Уже существует референс с таким заголовком',
        HttpStatus.NOT_MODIFIED,
      );
    }
  }

  async addToUser(referenceID, userID) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userID,
        refreshToken: {
          not: null,
        },
      },
    });
    this.checkUser(user);
    if (!user.references.includes(Number(referenceID))) {
      const allReferences = await this.prisma.reference.findMany();
      for (const reference of allReferences) {
        if (Number(referenceID) == Number(reference.id)) {
          await this.prisma.user.update({
            data: { references: { push: Number(reference.id) } },
            where: { id: Number(userID) },
          });
          return user;
        }
      }
      throw new HttpException('Референс не найден', HttpStatus.NOT_FOUND);
    } else {
      throw new HttpException('Референс уже добавлен', HttpStatus.FORBIDDEN);
    }
  }

  async removeFromUser(referenceID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user);
    const updatedReference = user.references.filter(
      (reference) => reference != Number(referenceID),
    );
    await this.prisma.user.update({
      where: { id: Number(userID) },
      data: { references: updatedReference },
    });
    return user;
  }

  async showUserReferences(userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user);

    const allReferences = await this.prisma.reference.findMany();
    const imagesList = [];
    user.references.forEach(function (referenceID) {
      const reference = allReferences.find((b) => b.id === referenceID);
      if (reference) {
        imagesList.push(reference);
      }
    });
    return imagesList;
  }

  async showAllReferences(response, page, size) {
    const allReferences = await this.prisma.reference.findMany();
    response.setHeader('X-Total-Count', `${allReferences.length}`);
    const cutAllReferences = await this.prisma.reference.findMany({
      skip: (page - 1) * size,
      take: Number(size),
    });
    return cutAllReferences;
  }

  async sortByName(text, response, page, size) {
    text = text.split(' ');
    const needCount = text.length;
    const allReferences = await this.prisma.reference.findMany();
    const filteredReferences = [];
    for (const reference of allReferences) {
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
      throw new HttpException('Заголовок не найден', HttpStatus.NOT_FOUND);
    } else {
      response.setHeader('X-Total-Count', `${filteredReferences.length}`);
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedReferences = filteredReferences.slice(
        startIndex,
        endIndex,
      );
      return paginatedReferences;
    }
  }

  async sortByHashtag(hashtags, response, page, size) {
    hashtags = hashtags.split(' ');
    const needCount = hashtags.length;
    const allReferences = await this.prisma.reference.findMany();
    const filteredReferences = [];
    for (const reference of allReferences) {
      let count = 0;
      for (const word of hashtags) {
        if (reference && reference.hashtag.includes(word)) {
          count += 1;
          if (count == needCount) {
            filteredReferences.push(reference);
          }
        }
      }
    }
    if (filteredReferences.length === 0) {
      throw new HttpException('Хэштэг не найден', HttpStatus.NOT_FOUND);
    } else {
      response.setHeader('X-Total-Count', `${filteredReferences.length}`);
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedReferences = filteredReferences.slice(
        startIndex,
        endIndex,
      );
      return paginatedReferences;
    }
  }

  async showReferenceByID(referenceID) {
    const reference = await this.prisma.reference.findUnique({
      where: { id: parseInt(referenceID) },
    });
    if (reference) {
      return reference;
    } else {
      throw new HttpException('Референс не найден', HttpStatus.NOT_FOUND);
    }
  }

  checkUser(user) {
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
  }
}
