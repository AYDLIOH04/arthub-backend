import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { GetCurrentUserId, Public } from '../common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProgramService } from './program.service';
import { ProgramDto } from './dto/program.dto';
import * as process from 'process';
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
    return this.programmService.addToUser(programmID, userId);
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
  showAllBrushes(
    @Query('system') system: string,
    @Query('search') search: string,
  ) {
    if (system) {
      return this.programmService.sortBySystem(system);
    } else if (search) {
      return this.programmService.sortByName(search);
    } else {
      return this.programmService.showAllPrograms();
    }
  }

  @Public()
  @Get('/:program')
  showProgram(@Param('program') program: string) {
    return this.programmService.showProgram(program);
  }
}
