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
import { ProgramService } from './program.service';
import { ProgramDto } from './dto/program.dto';

@Controller('program')
export class ProgramController {
  constructor(private programmService: ProgramService) {}
  @Public()
  @UseInterceptors(FileInterceptor('logo'))
  @Post('create')
  createProgram(@Body() dto: ProgramDto, @UploadedFile() logo) {
    return this.programmService.createProgramm(dto, logo);
  }

  @Public()
  @Post('add/:programmID/:userID')
  addToUser(
    @Param('programmID') programmID: string,
    @Param('userID') userID: string,
  ) {
    return this.programmService.addToUser(programmID, userID);
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
  showAllPrograms() {
    return this.programmService.showAllPrograms();
  }
}
