import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import {BrushDto} from "./dto/brush.dto";

@Injectable()
export class BrushService {
  constructor(
    private prisma: PrismaService,
    private fileService: FilesService,
  ) {}

  async createBrush(dto: BrushDto, image: any) {
    const fileName = await this.fileService.createFile(image);
    const newBrush = await this.prisma.brush.create({
      data: { ...dto, image: fileName },
    });
    return newBrush;
  }

  async addToUser(brushID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    if (!user.brushes.includes(Number(brushID))) {
      await this.prisma.user.update({
        data: { brushes: { push: Number(brushID) } },
        where: { id: Number(userID) },
      });
      return user;
    } else {
      throw new HttpException(
        'Такой уже есть',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeFromUser(brushID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    const updatedBrushes = user.brushes.filter(
      (brush) => brush != Number(brushID),
    );
    await this.prisma.user.update({
      where: { id: Number(userID) },
      data: { brushes: updatedBrushes },
    });
    return user;
  }

  async showUserBrushes(userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    const allBrushes = await this.prisma.brush.findMany();
    let imagesList = [];
    user.brushes.forEach(function (brushID) {
      const brush = allBrushes.find((b) => b.id === brushID);
      if (brush) {
        imagesList.push(`http://localhost:1111/${brush.image}`);
      }
    });
    return imagesList;
  }

  async showAllBrushes() {
    const allBrushes = await this.prisma.brush.findMany();
    return allBrushes.map((brush) => `http://localhost:1111/${brush.image}`);
  }
}
