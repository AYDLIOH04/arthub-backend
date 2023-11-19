import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {FilesService} from '../files/files.service';
import {BrushDto} from "./dto/brush.dto";

@Injectable()
export class BrushService {
    constructor(
        private prisma: PrismaService,
        private fileService: FilesService,
    ) {
    }

    async createBrush(dto: BrushDto, image: any) {
        const allBrushes = await this.prisma.brush.findMany();
        let flag = true;
        for (let i = 0; i < allBrushes.length; i++) {
            if (dto.title == allBrushes[i].title || dto.link == allBrushes[i].link) {
                flag = false;
            }
        }
        if (flag) {
            const fileName = await this.fileService.createFile(image);
            const newBrush = await this.prisma.brush.create({
                data: {...dto, image: fileName},
            });
            return newBrush;
        } else {
            throw new HttpException(
                'Такой заголовок или ссылка уже есть',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async addToUser(brushID, userID) {
        const user = await this.prisma.user.findUnique({
            where: {id: Number(userID)},
        });
        this.checkUser(user)
        if (!user.brushes.includes(Number(brushID))) {
            const allBrushes = await this.prisma.brush.findMany();
            for (let brush of allBrushes) {
                if (Number(brushID) == Number(brush.id)) {
                    await this.prisma.user.update({
                        data: {brushes: {push: Number(brushID)}},
                        where: {id: Number(userID)},
                    });
                    return user;
                }
            }
            throw new HttpException(
                'Такой кисти нет',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        } else {
            throw new HttpException(
                'Такой уже есть',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async removeFromUser(brushID, userID) {
        const user = await this.prisma.user.findUnique({
            where: {id: Number(userID)},
        });
        this.checkUser(user)
        const updatedBrushes = user.brushes.filter(
            (brush) => brush != Number(brushID),
        );
        await this.prisma.user.update({
            where: {id: Number(userID)},
            data: {brushes: updatedBrushes},
        });
        return user;
    }

    async showUserBrushes(userID) {
        const user = await this.prisma.user.findUnique({
            where: {id: Number(userID)},
        });
        this.checkUser(user)
        const allBrushes = await this.prisma.brush.findMany();
        let imagesList = [];
        user.brushes.forEach(function (brushID) {
            const brush = allBrushes.find((b) => b.id === brushID);
            if (brush) {
                imagesList.push(`http://localhost:7000/${brush.image}`);
            }
        });
        return imagesList;
    }

    async showAllBrushes() {
        const allBrushes = await this.prisma.brush.findMany();
        return allBrushes.map((brush) => `http://localhost:7000/${brush.image}`);
    }

    async sortByProgramm(program) {
        const allPrograms = await this.prisma.programm.findMany();
        const flag = allPrograms.find((x) => x.name === program)
        if (flag){
            const allBrushes = await this.prisma.brush.findMany();
            let filteredBrushes = []
            for (let brush of allBrushes){
                if (brush.programm == program){
                    filteredBrushes.push(`http://localhost:7000/${brush.image}`);
                }
            }
            if(filteredBrushes.length===0){
                throw new HttpException(
                    'Нет таких программ',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }else {
                return filteredBrushes
            }
        }
        else{
            throw new HttpException(
                'Такой программы нет',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    checkUser(user){
        if (!user) {throw new HttpException(
            'Такого юзера нет',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );}
    }
}
