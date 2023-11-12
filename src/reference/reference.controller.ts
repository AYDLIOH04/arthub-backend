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
import { ReferenceService } from './reference.service';
import { ReferenceDto } from './dto/reference.dto';

@Controller('reference')
export class ReferenceController {
  constructor(private referenceService: ReferenceService) {}
  @Public()
  @UseInterceptors(FileInterceptor('image'))
  @Post('create')
  createBrush(@Body() dto: ReferenceDto, @UploadedFile() image) {
    return this.referenceService.createReference(dto, image);
  }

  @Public()
  @Post('add/:referenceID/:userID')
  addToUser(
    @Param('referenceID') referenceID: string,
    @Param('userID') userID: string,
  ) {
    return this.referenceService.addToUser(referenceID, userID);
  }

  @Public()
  @Post('remove/:referenceID/:userID')
  removeFromUser(
    @Param('referenceID') referenceID: string,
    @Param('userID') userID: string,
  ) {
    return this.referenceService.removeFromUser(referenceID, userID);
  }
}
