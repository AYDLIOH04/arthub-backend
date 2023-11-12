import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { ReferenceDto } from '../auth/dto/reference.dto';

@Injectable()
export class ReferenceService {
  constructor(
    private prisma: PrismaService,
    private fileService: FilesService,
  ) {}

  async createReference(dto: ReferenceDto, image: any) {
    const fileName = await this.fileService.createFile(image);
    const newReference = await this.prisma.reference.create({
      data: { ...dto, image: fileName },
    });
    return newReference;
  }

  async addToUser(referenceID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    user.references.push(referenceID);
    return user;
  }

  async removeFromUser(referenceID, userID) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userID) },
    });
    delete user.references[referenceID];
    return user;
  }
}
