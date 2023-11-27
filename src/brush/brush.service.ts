import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { BrushDto } from './dto/brush.dto';

@Injectable()
export class BrushService {
  constructor(
    private prisma: PrismaService,
    private fileService: FilesService,
  ) {}

  async createBrush(dto: BrushDto, image: any) {
    const allBrushes = await this.prisma.brush.findMany();
    const hasDuplicate = allBrushes.some(
      (brush) => brush.title === dto.title || brush.link === dto.link,
    );
    if (!hasDuplicate) {
      const fileName = await this.fileService.createFile(image);
      const newBrush = await this.prisma.brush.create({
        data: { ...dto, image: `http://localhost:7000/${fileName}` },
      });
      return newBrush;
    } else {
      throw new HttpException(
        'Уже существует кисть с таким заголовком или ссылкой',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async addToUser(brushID, userID) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userID,
        refreshToken: {
          not: null,
        },
      },
    });
    this.checkUser(user);
    if (!user.brushes.includes(Number(brushID))) {
      const allBrushes = await this.prisma.brush.findMany();
      for (const brush of allBrushes) {
        if (Number(brushID) == Number(brush.id)) {
          await this.prisma.user.update({
            data: { brushes: { push: Number(brushID) } },
            where: { id: Number(userID) },
          });
          return user;
        }
      }
      throw new HttpException('Кисть не найдена', HttpStatus.NOT_FOUND);
    } else {
      throw new HttpException('Кисть уже добавлена', HttpStatus.FORBIDDEN);
    }
  }

  async removeFromUser(brushID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user);
    const updatedBrushes = user.brushes.filter(
      (brush) => brush != Number(brushID),
    );
    await this.prisma.user.update({
      where: { id: Number(userID) },
      data: { brushes: updatedBrushes },
    });
    return user;
  }

  async showAllLikedBrushes(page, size, userId) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    this.checkUser(user);
    const userBrushes = user.brushes;
    const allBrushes = await this.prisma.brush.findMany();
    const cutAllBrushes = await this.prisma.brush.findMany({
      skip: (page - 1) * size,
      take: Number(size),
    });
    const updatedBrushes = cutAllBrushes.map((brush) => {
      const isFavorite = userBrushes.some(
        (userBrushes) => userBrushes === brush.id,
      );
      return { ...brush, favorite: isFavorite };
    });

    const startIndex = (page - 1) * size;
    const endIndex = page * size;
    const paginatedBrushes = updatedBrushes.slice(startIndex, endIndex);
    return { response: paginatedBrushes, totalCount: updatedBrushes.length };
  }

  async showAllBrushes(page, size) {
    const allBrushes = await this.prisma.brush.findMany();
    const cutAllBrushes = await this.prisma.brush.findMany({
      skip: (page - 1) * size,
      take: Number(size),
    });
    return { response: cutAllBrushes, totalCount: allBrushes.length };
  }

  async showBrushByID(brushID) {
    const brush = await this.prisma.brush.findUnique({
      where: { id: Number(brushID) },
    });
    if (brush) {
      return brush;
    } else {
      throw new HttpException('Кисть не найдена', HttpStatus.NOT_FOUND);
    }
  }

  async sortByProgram(program, page, size) {
    const allBrushes = await this.prisma.brush.findMany({
      where: { program: { contains: program, mode: 'insensitive' } },
    });
    if (allBrushes.length === 0) {
      throw new HttpException(
        'Кисть с такой программой не найдена',
        HttpStatus.NOT_FOUND,
      );
    }
    const startIndex = (page - 1) * size;
    const endIndex = page * size;
    const paginatedBrushes = allBrushes.slice(startIndex, endIndex);
    return { response: paginatedBrushes, totalCount: allBrushes.length };
  }

  async sortByName(text, page, size) {
    text = text.split(' ');
    const needCount = text.length;
    const allBrushes = await this.prisma.brush.findMany();
    const filteredBrushes = [];
    for (const brush of allBrushes) {
      let count = 0;
      for (const word of text) {
        if (brush && brush.title.toLowerCase().includes(word.toLowerCase())) {
          count += 1;
          if (count == needCount) {
            filteredBrushes.push(brush);
          }
        }
      }
    }
    if (filteredBrushes.length === 0) {
      throw new HttpException('Кисть не найдена', HttpStatus.NOT_FOUND);
    } else {
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedBrushes = filteredBrushes.slice(startIndex, endIndex);
      return { response: paginatedBrushes, totalCount: filteredBrushes.length };
    }
  }

  async sortByNameAndProgram(program, text, page, size) {
    const allBrushes = await this.prisma.brush.findMany({
      where: { program: { contains: program, mode: 'insensitive' } },
    });
    if (allBrushes.length === 0) {
      throw new HttpException(
        'Кисть с такой программой не найдена',
        HttpStatus.NOT_FOUND,
      );
    }
    text = text.split(' ');
    const needCount = text.length;
    const filteredBrushes = [];
    for (const brush of allBrushes) {
      let count = 0;
      for (const word of text) {
        if (brush && brush.title.toLowerCase().includes(word.toLowerCase())) {
          count += 1;
          if (count == needCount) {
            filteredBrushes.push(brush);
          }
        }
      }
    }
    if (filteredBrushes.length === 0) {
      throw new HttpException('Кисть не найдена', HttpStatus.NOT_FOUND);
    } else {
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedBrushes = filteredBrushes.slice(startIndex, endIndex);
      return { response: paginatedBrushes, totalCount: filteredBrushes.length };
    }
  }

  checkUser(user) {
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
  }
}
