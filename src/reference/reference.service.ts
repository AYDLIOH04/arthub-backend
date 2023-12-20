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
    const hasDuplicate = allReferences.some(
      (reference) => reference.title === dto.title,
    );
    if (!hasDuplicate) {
      const fileName = await this.fileService.createFile(image);
      const newReference = await this.prisma.reference.create({
        data: { ...dto, image: `${process.env.URL}/${fileName}` },
      });
      return newReference;
    } else {
      throw new HttpException(
        'Уже существует референс с таким заголовком',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async addAndRemove(referenceID, userID) {
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
      const updatedReferences = user.references.filter(
        (reference) => reference != Number(referenceID),
      );
      await this.prisma.user.update({
        where: { id: Number(userID) },
        data: { references: updatedReferences },
      });
      return user;
    }
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

  async showAllReferences(page, size) {
    const allReferences = await this.prisma.reference.findMany();
    const cutAllReferences = await this.prisma.reference.findMany({
      skip: (page - 1) * size,
      take: Number(size),
    });
    return { response: cutAllReferences, totalCount: allReferences.length };
  }

  async showAllLikedReferences(page, size, userId) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    this.checkUser(user);
    const allReferences = await this.prisma.reference.findMany();
    const userReferences = user.references;
    const cutAllReferences = await this.prisma.reference.findMany({
      skip: (page - 1) * size,
      take: Number(size),
    });
    const updatedReferences = cutAllReferences.map((reference) => {
      const isFavorite = userReferences.some(
        (userReferences) => userReferences === reference.id,
      );
      return { ...reference, favorite: isFavorite };
    });
    return { response: updatedReferences, totalCount: allReferences.length };
  }

  async sortByName(text, page, size) {
    text = text.split(' ');
    const needCount = text.length;
    const allReferences = await this.prisma.reference.findMany();
    const filteredReferences = [];
    for (const reference of allReferences) {
      let count = 0;
      for (const word of text) {
        if (
          reference &&
          reference.title.toLowerCase().includes(word.toLowerCase())
        ) {
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
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedReferences = filteredReferences.slice(
        startIndex,
        endIndex,
      );
      return {
        response: paginatedReferences,
        totalCount: filteredReferences.length,
      };
    }
  }

  async sortByHashtagAndName(hashtags, text, page, size) {
    hashtags = hashtags.split(' ');
    const needCount = hashtags.length;
    const allReferences = await this.prisma.reference.findMany();
    const filteredReferences = [];
    for (const reference of allReferences) {
      let count = 0;
      for (const word of hashtags) {
        if (
          reference &&
          reference.hashtag.toLowerCase().includes(word.toLowerCase())
        ) {
          count += 1;
          if (count == needCount) {
            filteredReferences.push(reference);
          }
        }
      }
    }
    text = text.split(' ');
    const needCount2 = text.length;
    const filteredReferences2 = [];
    for (const reference of filteredReferences) {
      let count = 0;
      for (const word of text) {
        if (
          reference &&
          reference.title.toLowerCase().includes(word.toLowerCase())
        ) {
          count += 1;
          if (count == needCount2) {
            filteredReferences2.push(reference);
          }
        }
      }
    }
    if (filteredReferences2.length === 0) {
      throw new HttpException('Хэштэг не найден', HttpStatus.NOT_FOUND);
    } else {
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedReferences = filteredReferences2.slice(
        startIndex,
        endIndex,
      );
      return {
        response: paginatedReferences,
        totalCount: filteredReferences2.length,
      };
    }
  }

  async sortByHashtag(hashtags, page, size) {
    hashtags = hashtags.split(' ');
    const needCount = hashtags.length;
    const allReferences = await this.prisma.reference.findMany();
    const filteredReferences = [];
    for (const reference of allReferences) {
      let count = 0;
      for (const word of hashtags) {
        if (
          reference &&
          reference.hashtag.toLowerCase().includes(word.toLowerCase())
        ) {
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
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedReferences = filteredReferences.slice(
        startIndex,
        endIndex,
      );
      return {
        response: paginatedReferences,
        totalCount: filteredReferences.length,
      };
    }
  }

  async showLikedByTag(tag, page, size, userId) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    this.checkUser(user);
    const allReferences = await this.prisma.reference.findMany({
      where: {
        hashtag: {
          contains: tag,
          mode: 'insensitive',
        },
      },
    });
    const userReferences = user.references;
    const cutAllReferences = await this.prisma.reference.findMany({
      skip: (page - 1) * size,
      take: Number(size),
    });
    const updatedReferences = cutAllReferences.map((reference) => {
      const isFavorite = userReferences.some(
        (userBrushes) => userBrushes === reference.id,
      );
      return { ...reference, favorite: isFavorite };
    });
    return { response: updatedReferences, totalCount: allReferences.length };
  }

  async showLikedByName(text, page, size, userId) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    this.checkUser(user);

    text = text.split(' ');
    const needCount = text.length;
    const allReferences = await this.prisma.reference.findMany();
    const userReferences = user.references;
    const filteredReferences = [];
    for (const reference of allReferences) {
      let count = 0;
      for (const word of text) {
        if (
          reference &&
          reference.title.toLowerCase().includes(word.toLowerCase())
        ) {
          count += 1;
          if (count == needCount) {
            filteredReferences.push(reference);
          }
        }
      }
    }
    const updatedReferences = filteredReferences.map((reference) => {
      const isFavorite = userReferences.some(
        (userBrushes) => userBrushes === reference.id,
      );
      return { ...reference, favorite: isFavorite };
    });
    if (updatedReferences.length === 0) {
      throw new HttpException('Референс не найден', HttpStatus.NOT_FOUND);
    } else {
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedReferences = updatedReferences.slice(startIndex, endIndex);
      return {
        response: paginatedReferences,
        totalCount: filteredReferences.length,
      };
    }
  }

  async showLikedByNameAndTag(tag, text, page, size, userId) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    this.checkUser(user);

    const allReferences = await this.prisma.reference.findMany({
      where: {
        hashtag: {
          contains: tag,
          mode: 'insensitive',
        },
      },
    });
    if (allReferences.length === 0) {
      throw new HttpException(
        'Кисть с такой программой не найдена',
        HttpStatus.NOT_FOUND,
      );
    }

    text = text.split(' ');
    const needCount = text.length;
    const userReferences = user.references;
    const filteredReferences = [];
    for (const reference of allReferences) {
      let count = 0;
      for (const word of text) {
        if (
          reference &&
          reference.title.toLowerCase().includes(word.toLowerCase())
        ) {
          count += 1;
          if (count == needCount) {
            filteredReferences.push(reference);
          }
        }
      }
    }
    const updatedReferences = filteredReferences.map((reference) => {
      const isFavorite = userReferences.some(
        (userBrushes) => userBrushes === reference.id,
      );
      if (reference.hashtag.includes(tag)) {
        return { ...reference, favorite: isFavorite };
      }
    });
    if (updatedReferences.length === 0) {
      throw new HttpException('Кисть не найдена', HttpStatus.NOT_FOUND);
    } else {
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedReferences = updatedReferences.slice(startIndex, endIndex);
      return {
        response: paginatedReferences,
        totalCount: filteredReferences.length,
      };
    }
  }

  checkUser(user) {
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
  }
}
