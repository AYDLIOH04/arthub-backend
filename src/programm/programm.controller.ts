import {Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import {Public} from "../common/decorators";
import {FileInterceptor} from "@nestjs/platform-express";
import {ProgrammService} from "./programm.service";
import {ProgrammDto} from "../auth/dto/programm.dto";

@Controller('programm')
export class ProgrammController {

    constructor(private programmService: ProgrammService) {
    }
    @Public()
    @UseInterceptors(FileInterceptor('image'))
    @Post('create')
    createBrush(@Body() dto: ProgrammDto, @UploadedFile() image) {
        return this.programmService.createProgramm(dto, image)
    }

    @Public()
    @Post('add/:programmID/:userID')
    addToUser(@Param('programmID') programmID: string, @Param('userID') userID: string) {
        return this.programmService.addToUser(programmID, userID)
    }

    @Public()
    @Post('remove/:programmID/:userID')
    removeFromUser(@Param('programmID') programmID: string, @Param('userID') userID: string) {
        return this.programmService.removeFromUser(programmID, userID)
    }
}
