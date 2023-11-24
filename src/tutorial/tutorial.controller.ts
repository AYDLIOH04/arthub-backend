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
import { FileInterceptor } from '@nestjs/platform-express';
import { TutorialDto } from './dto/tutorial.dto';
import { TutorialService } from './tutorial.service';
import { Response } from 'express';

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
    return this.tutorialService.addToUser(referenceID, userId);
  }

  @Public()
  @Post('remove/:tutorialID/:userID')
  removeFromUser(
    @Param('tutorialID') tutorialID: string,
    @Param('userID') userID: string,
  ) {
    return this.tutorialService.removeFromUser(tutorialID, userID);
  }

  @Public()
  @Get()
  async showAllTutorials(
    @Query('program') program: string,
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('size') size: string,
    @Res() response: Response,
  ) {
    if (program && page && size) {
      const sortedByProgram = await this.tutorialService.sortByProgram(
        program,
        response,
        page,
        size,
      );
      return response.json(sortedByProgram);
    }
    if (search && page && size) {
      const sortedByName = await this.tutorialService.sortByName(
        search,
        response,
        page,
        size,
      );
      return response.json(sortedByName);
    }
    if (page && size) {
      const allTutorials = await this.tutorialService.showAllTutorials(
        response,
        page,
        size,
      );
      return response.json(allTutorials);
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
