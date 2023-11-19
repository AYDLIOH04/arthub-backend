import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
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
    let allTutorials = await this.prisma.tutorial.findMany();
    let flag = true;
    for (let i = 0; i < allTutorials.length; i++) {
      if (dto.title == allTutorials[i].title || dto.link == allTutorials[i].link) {
        flag = false;
      }
    }
    if (flag){
      const fileName = await this.fileService.createFile(image);
      const newTutorial = await this.prisma.tutorial.create({
        data: { ...dto, image: fileName },
      });
      return newTutorial;
    }else{
      throw new HttpException(
          'Такой заголовок или ссылка уже есть',
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addToUser(tutorialID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user)
    user.tutorials.push(tutorialID);
    return user;
  }

  async removeFromUser(tutorialID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user)
    delete user.tutorials[tutorialID];
    return user;
  }

  checkUser(user){
    if (!user) {throw new HttpException(
        'Такого юзера нет',
        HttpStatus.INTERNAL_SERVER_ERROR,
    );}
  }
}
