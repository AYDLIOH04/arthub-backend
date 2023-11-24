import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GetCurrentUserId, Public } from '../common/decorators';
import { BrushService } from './brush.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrushDto } from './dto/brush.dto';
import { Response } from 'express';

@Controller('brushes')
export class BrushController {
  constructor(private brushService: BrushService) {}
  @Public()
  @UseInterceptors(FileInterceptor('image'))
  @Post('create')
  createBrush(@Body() dto: BrushDto, @UploadedFile() image) {
    return this.brushService.createBrush(dto, image);
  }

  @Post(':brushID/add-favorite')
  addToUser(
    @Param('brushID') brushID: string,
    @GetCurrentUserId() userId: number,
  ) {
    return this.brushService.addToUser(brushID, userId);
  }

  @Public()
  @Post('remove/:brushID/:userID')
  removeFromUser(
    @Param('brushID') brushID: string,
    @Param('userID') userID: string,
  ) {
    return this.brushService.removeFromUser(brushID, userID);
  }

  @Public()
  @Get()
  async showFlitBrushes(
    @Query('program') program: string,
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('size') size: string,
    @Res() response: Response,
  ) {
    if (program && page && size) {
      const sortedByProgram = await this.brushService.sortByProgram(
        program,
        response,
        page,
        size,
      );
      return response.json(sortedByProgram);
    }
    if (search && page && size) {
      const sortedByName = await this.brushService.sortByName(
        search,
        response,
        page,
        size,
      );
      return response.json(sortedByName);
    }
    if (page && size) {
      const allBrushes = await this.brushService.showAllBrushes(
        response,
        page,
        size,
      );
      return response.json(allBrushes);
    } else {
      throw new HttpException('Bad request', HttpStatus.NOT_FOUND);
    }
  }

  @Get('/like')
  async showAllBrushes(
    @Query('program') program: string,
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('size') size: string,
    @GetCurrentUserId() userId: number,
    @Res() response: Response,
  ) {
    if (page && size) {
      const allBrushes = await this.brushService.showAllLikedBrushes(
        response,
        page,
        size,
        userId,
      );
      return response.json(allBrushes);
    } else {
      throw new HttpException('Bad request', HttpStatus.NOT_FOUND);
    }
  }

  @Public()
  @Get('/:brushID')
  showBrushByID(@Param('brushID') brushID: string) {
    return this.brushService.showBrushByID(brushID);
  }
}
