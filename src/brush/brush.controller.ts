import {Body, Controller, Get, Param, Post, Put, UploadedFile, UseInterceptors} from '@nestjs/common';
import {Public} from "../common/decorators";
import {BrushService} from "./brush.service";
import {BrushDto} from "../auth/dto/brush.dto";
import {FileInterceptor} from "@nestjs/platform-express";

@Controller('brush')
export class BrushController {

    constructor(private brushService: BrushService) {
    }
    @Public()
    @UseInterceptors(FileInterceptor('image'))
    @Post('create')
    createBrush(@Body() dto: BrushDto, @UploadedFile() image) {
        return this.brushService.createBrush(dto, image)
    }

    @Public()
    @Put('add/:brushID/:userID')
    addToUser(@Param('brushID') brushID: string, @Param('userID') userID: string) {
        return this.brushService.addToUser(brushID, userID)
    }

    @Public()
    @Post('remove/:brushID/:userID')
    removeFromUser(@Param('brushID') brushID: string, @Param('userID') userID: string) {
        return this.brushService.removeFromUser(brushID, userID)
    }

    @Public()
    @Post(':userID')
    showUserBrushes(@Param('userID') userID: string) {
        return this.brushService.showUserBrushes(userID)
    }

    @Public()
    @Get()
    showAllBrushes() {
        return this.brushService.showAllBrushes()
    }
}
