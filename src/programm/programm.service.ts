import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {FilesService} from '../files/files.service';
import {ProgramDto} from './dto/programm.dto';

@Injectable()
export class ProgrammService {
    constructor(
        private prisma: PrismaService,
        private fileService: FilesService,
    ) {
    }

    async createProgramm(dto: ProgramDto, logo: any) {
      const allPrograms = await this.prisma.programm.findMany();
      let flag = true;

      for (let i = 0; i < allPrograms.length; i++) {
        if (dto.name == allPrograms[i].name || dto.link == allPrograms[i].link) {
          flag = false;
        }
      }
      if (flag) {
        const fileName = await this.fileService.createFile(logo);
        const newProgram = await this.prisma.programm.create({
          data: {...dto, logo: fileName},
        });
        return newProgram;
      } else {
        throw new HttpException(
            'Такая программа или ссылка уже есть',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    async addToUser(programmID, userID) {
        const user = await this.prisma.user.findUnique({
            where: {id: Number(userID)},
        });
        this.checkUser(user)
        user.programm.push(programmID);
        return user;
    }

    async removeFromUser(programmID, userID) {
        const user = await this.prisma.user.findUnique({
            where: {id: Number(userID)},
        });
        this.checkUser(user)
        delete user.programm[programmID];
        return user;
    }

    checkUser(user){
        if (!user) {throw new HttpException(
            'Такого юзера нет',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );}
    }
}
