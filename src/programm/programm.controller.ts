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
import { ProgrammService } from './programm.service';
import {ProgramDto} from './dto/programm.dto';

@Controller('program')
export class ProgrammController {
  constructor(private programmService: ProgrammService) {}
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
}
