import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { GetCurrentUserId, Public } from '../common/decorators';
import { ProgramService } from './program.service';
import { ProgramFullDto } from './dto/fullProgram.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('programs')
export class ProgramController {
  constructor(private programmService: ProgramService) {}
  @Public()
  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'example1', maxCount: 1 },
      { name: 'example2', maxCount: 1 },
      { name: 'example3', maxCount: 1 },
    ]),
  )
  createProgram(@Body() dto: ProgramFullDto, @UploadedFiles() files) {
    const { logo, example1, example2, example3 } = files;
    return this.programmService.createProgramm(
      dto,
      logo[0],
      example1[0],
      example2[0],
      example3[0],
    );
  }

  @Post(':programmID/add-favorite')
  addToUser(
    @Param('programmID') programmID: string,
    @GetCurrentUserId() userId: number,
  ) {
    return this.programmService.addAndRemove(programmID, userId);
  }

  @Public()
  @Post('remove/:programmID/:userID')
  removeFromUser(
    @Param('programmID') programmID: string,
    @Param('userID') userID: string,
  ) {
    return this.programmService.removeFromUser(programmID, userID);
  }

  @Public()
  @Get()
  async showAllPrograms(
    @Query('system') system: string,
    @Query('search') search: string,
  ) {
    if (system && search) {
      return await this.programmService.showByNameAndSystem(system, search);
    }
    if (system) {
      return await this.programmService.sortBySystem(system);
    } else if (search) {
      return await this.programmService.sortByName(search);
    } else {
      return await this.programmService.showAllPrograms();
    }
  }

  @Get('/like')
  async showAllBrushes(
    @Query('system') system: string,
    @Query('search') search: string,
    @GetCurrentUserId() userId: number,
  ) {
    if (system && search) {
      return await this.programmService.showLikedByNameAndSystem(
        system,
        search,
        userId,
      );
    }
    if (system) {
      return await this.programmService.showLikedBySystem(system, userId);
    }
    if (search) {
      return await this.programmService.showLikedByName(search, userId);
    } else {
      return await this.programmService.showAllLikedPrograms(userId);
    }
  }

  @Public()
  @Get('/:program')
  showProgram(@Param('program') program: string) {
    return this.programmService.showProgram(program);
  }
}
