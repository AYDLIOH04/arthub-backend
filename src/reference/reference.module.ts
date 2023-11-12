import { Module } from '@nestjs/common';
import { ReferenceService } from './reference.service';
import {ReferenceController} from "./reference.controller";
import {FilesModule} from "../files/files.module";

@Module({
  controllers: [ReferenceController],
  providers: [ReferenceService],
  imports: [FilesModule]
})
export class ReferenceModule {}
