import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GetCurrentUserId, Public } from '../common/decorators';
import { BrushService } from './brush.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrushDto } from './dto/brush.dto';

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
  ) {
    if (program && page && size) {
      return await this.brushService.sortByProgram(program, page, size);
    }
    if (search && page && size) {
      return await this.brushService.sortByName(search, page, size);
    }
    if (page && size) {
      return await this.brushService.showAllBrushes(page, size);
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
  ) {
    if (page && size) {
      return await this.brushService.showAllLikedBrushes(page, size, userId);
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
