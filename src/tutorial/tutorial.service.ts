import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { TutorialDto } from '../auth/dto/tutorial.dto';

@Injectable()
export class TutorialService {
  constructor(
    private prisma: PrismaService,
    private fileService: FilesService,
  ) {}

  async createTutorial(dto: TutorialDto, image: any) {
    const fileName = await this.fileService.createFile(image);
    const newTutorial = await this.prisma.tutorial.create({
      data: { ...dto, image: fileName },
    });
    return newTutorial;
  }

  async addToUser(tutorialID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    user.tutorials.push(tutorialID);
    return user;
  }

  async removeFromUser(tutorialID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    delete user.tutorials[tutorialID];
    return user;
  }
}
