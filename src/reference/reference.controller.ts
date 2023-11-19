import {
  Body,
  Controller,
  Get,
  Param,
  Post, Put, Query,
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
  createReference(@Body() dto: ReferenceDto, @UploadedFile() image) {
    return this.referenceService.createReference(dto, image);
  }

  @Public()
  @Put('add/:referenceID/:userID')
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

  @Public()
  @Post(':userID')
  showUserReferences(@Param('userID') userID: string) {
    return this.referenceService.showUserReferences(userID);
  }

  @Public()
  @Get()
  showAllReference() {
    return this.referenceService.showAllReferences();
  }

  @Public()
  @Get('filt_name')
  sortByName(@Query('name') name: string){
    return this.referenceService.sortByName(name)
  }

  @Public()
  @Get('filt_tag')
  sortByHashtag(@Query('tag') tag: string){
    return this.referenceService.sortByHashtag(tag)
  }
}
