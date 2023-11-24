import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GetCurrentUserId, Public } from '../common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReferenceService } from './reference.service';
import { ReferenceDto } from './dto/reference.dto';
import { Response } from 'express';

@Controller('references')
export class ReferenceController {
  constructor(private referenceService: ReferenceService) {}
  @Public()
  @UseInterceptors(FileInterceptor('image'))
  @Post('create')
  createReference(@Body() dto: ReferenceDto, @UploadedFile() image) {
    return this.referenceService.createReference(dto, image);
  }

  @Post(':referenceID/add-favorite')
  addToUser(
    @Param('referenceID') referenceID: string,
    @GetCurrentUserId() userId: number,
  ) {
    return this.referenceService.addToUser(referenceID, userId);
  }

  @Public()
  @Post('remove/:referenceID/:userID')
  removeFromUser(
    @Param('referenceID') referenceID: string,
    @Param('userID') userID: string,
  ) {
    return this.referenceService.removeFromUser(referenceID, userID);
  }

  @Public()
  @Post(':userID')
  showUserReferences(@Param('userID') userID: string) {
    return this.referenceService.showUserReferences(userID);
  }

  @Public()
  @Get()
  async showAllReference(
    @Query('tag') tag: string,
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('size') size: string,
    @Res() response: Response,
  ) {
    if (tag && page && size) {
      const sortedByProgram = await this.referenceService.sortByHashtag(
        tag,
        response,
        page,
        size,
      );
      return response.json(sortedByProgram);
    }
    if (search && page && size) {
      const sortedByName = await this.referenceService.sortByName(
        search,
        response,
        page,
        size,
      );
      return response.json(sortedByName);
    }
    if (page && size) {
      const allBrushes = await this.referenceService.showAllReferences(
        response,
        page,
        size,
      );
      return response.json(allBrushes);
    } else {
      throw new HttpException('Bad request', HttpStatus.NOT_FOUND);
    }
  }

  @Public()
  @Get('/:referenceID')
  showBrushByID(@Param('referenceID') referenceID: string) {
    return this.referenceService.showReferenceByID(referenceID);
  }
}
