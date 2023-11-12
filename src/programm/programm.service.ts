import { Injectable } from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {FilesService} from "../files/files.service";
import {ProgrammDto} from "../auth/dto/programm.dto";

@Injectable()
export class ProgrammService {

    constructor(private prisma: PrismaService, private fileService: FilesService) {}

    async createProgramm(dto: ProgrammDto, image: any){
        const fileName = await this.fileService.createFile(image)
        const newProgramm = await this.prisma.programm.create({data: {...dto, image: fileName}});
        return newProgramm
    }

    async addToUser(programmID, userID ) {
        const user = await this.prisma.user.findUnique({where: {id: Number(userID)}})
        user.programm.push(programmID)
        return user
    }

    async removeFromUser(programmID, userID ) {
        const user = await this.prisma.user.findUnique({where: {id: Number(userID)}})
        delete user.programm[programmID]
        return user
    }
}
