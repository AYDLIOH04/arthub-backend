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
import { FileInterceptor } from '@nestjs/platform-express';
import { TutorialDto } from './dto/tutorial.dto';
import { TutorialService } from './tutorial.service';

@Controller('tutorials')
export class TutorialController {
  constructor(private tutorialService: TutorialService) {}
  @Public()
  @UseInterceptors(FileInterceptor('image'))
  @Post('create')
  createBrush(@Body() dto: TutorialDto, @UploadedFile() image) {
    return this.tutorialService.createTutorial(dto, image);
  }

  @Post(':referenceID/add-favorite')
  addToUser(
    @Param('referenceID') referenceID: string,
    @GetCurrentUserId() userId: number,
  ) {
    return this.tutorialService.addAndRemove(referenceID, userId);
  }

  @Public()
  @Get()
  async showAllTutorials(
    @Query('program') program: string,
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('size') size: string,
  ) {
    if (program && search && page && size) {
      return await this.tutorialService.sortByProgramAndName(
        program,
        search,
        page,
        size,
      );
    }
    if (program && page && size) {
      return await this.tutorialService.sortByProgram(program, page, size);
    }
    if (search && page && size) {
      return await this.tutorialService.sortByName(search, page, size);
    }
    if (page && size) {
      return await this.tutorialService.showAllTutorials(page, size);
    } else {
      throw new HttpException('Bad request', HttpStatus.NOT_FOUND);
    }
  }

  @Get('/like')
  async showAllLikedTutorials(
    @Query('program') program: string,
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('size') size: string,
    @GetCurrentUserId() userId: number,
  ) {
    if (program && search && page && size) {
      return await this.tutorialService.showLikedByNameAndProgram(
        program,
        search,
        page,
        size,
        userId,
      );
    }
    if (program && page && size) {
      return await this.tutorialService.showLikedByProgram(
        program,
        page,
        size,
        userId,
      );
    }
    if (search && page && size) {
      return await this.tutorialService.showLikedByName(
        search,
        page,
        size,
        userId,
      );
    }
    if (page && size) {
      return await this.tutorialService.showAllLikedTutorials(
        page,
        size,
        userId,
      );
    } else {
      throw new HttpException('Bad request', HttpStatus.NOT_FOUND);
    }
  }

  @Public()
  @Get('/:tutorialID')
  showTutorialByID(@Param('tutorialID') tutorialID: string) {
    return this.tutorialService.showTutorialByID(tutorialID);
  }
}
