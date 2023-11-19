import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
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
    let flag = true
    for (let i=0; i<allReferences.length; i++){
      if (dto.title == allReferences[i].title){
        flag = false;
      }
    }
    if (flag){
      const fileName = await this.fileService.createFile(image);
      const newReference = await this.prisma.reference.create({
        data: { ...dto, image: fileName },
      });
      return newReference;
    }
    else {
      throw new HttpException(
          'Такой заголовок',
          HttpStatus.INTERNAL_SERVER_ERROR,
      );}

  }

  async addToUser(referenceID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user)
    if (user.references.length === 0 || !user.references.includes(Number(referenceID))) {
      const allReferences = await this.prisma.reference.findMany();
      for (let reference of allReferences) {
        if (Number(referenceID) == Number(reference.id)) {
          await this.prisma.user.update({
            data: {references: {push: Number(reference.id)}},
            where: {id: Number(userID)},
          });
          return user;
        }
      }
      throw new HttpException(
          'Такого референса нет',
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      throw new HttpException(
          'Такой уже есть',
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeFromUser(referenceID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    this.checkUser(user)
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
    this.checkUser(user)

    const allReferences = await this.prisma.reference.findMany();
    let imagesList = [];
    user.references.forEach(function (referenceID) {
      const reference = allReferences.find((b) => b.id === referenceID);
      if (reference) {
        imagesList.push(`http://localhost:7000/${reference.image}`);
      }
    });
    return imagesList;
  }

  async showAllReferences() {
    const allReferences = await this.prisma.reference.findMany();
    return allReferences.map((reference) => `http://localhost:7000/${reference.image}`);
  }

  async sortByName(text) {
    text = text.split(' ')
    let needCount = text.length
    let allReferencses = await this.prisma.reference.findMany()

    let filteredReferences = []
    for (let reference of allReferencses) {
      let count = 0
      for (let word of text) {
        if (reference && reference.title.includes(word)) {
          count += 1
          if (count == needCount) {
            filteredReferences.push(`http://localhost:7000/${reference.image}`);
          }
        }
      }
    }
    if (filteredReferences.length===0){
      throw new HttpException(
          'Нет таких программ',
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }else { return filteredReferences}
  }

  async sortByHashtag(hashtag) {
    let allReferencses = await this.prisma.reference.findMany()
    let filteredReferences = []
    for (let reference of allReferencses) {
      if (reference) {
        let text = reference.hashtag.split('#')
        for (let word of text) {
          if (word.trim() == hashtag) {
            filteredReferences.push(`http://localhost:7000/${reference.image}`);
          }
        }
      }
    }
    if (filteredReferences.length===0){
      throw new HttpException(
          'Нет таких программ',
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }else { return filteredReferences}
  }

  checkUser(user){
    if (!user) {throw new HttpException(
        'Такого юзера нет',
        HttpStatus.INTERNAL_SERVER_ERROR,
    );}
  }
}
