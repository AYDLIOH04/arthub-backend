import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from '../common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { TutorialDto } from './dto/tutorial.dto';
import { TutorialService } from './tutorial.service';

@Controller('tutorial')
export class TutorialController {
  constructor(private tutorialService: TutorialService) {}
  @Public()
  @UseInterceptors(FileInterceptor('image'))
  @Post('create')
  createBrush(@Body() dto: TutorialDto, @UploadedFile() image) {
    return this.tutorialService.createTutorial(dto, image);
  }

  @Public()
  @Post('add/:tutorialID/:userID')
  addToUser(
    @Param('tutorialID') tutorialID: string,
    @Param('userID') userID: string,
  ) {
    return this.tutorialService.addToUser(tutorialID, userID);
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
  showAllPrograms() {
    return this.tutorialService.showAllTutorials();
  }
}
