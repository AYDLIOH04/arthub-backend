import { Module } from '@nestjs/common';
import { TutorialService } from './tutorial.service';
import {FilesModule} from "../files/files.module";
import {TutorialController} from "./tutorial.controller";

@Module({
  controllers: [TutorialController],
  providers: [TutorialService],
  imports: [FilesModule]
})
export class TutorialModule {}
