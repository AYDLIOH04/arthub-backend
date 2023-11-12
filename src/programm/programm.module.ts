import { Module } from '@nestjs/common';
import { ProgrammService } from './programm.service';
import {FilesModule} from "../files/files.module";
import {ProgrammController} from "./programm.controller";

@Module({
  controllers: [ProgrammController],
  providers: [ProgrammService],
  imports: [FilesModule]
})
export class ProgrammModule {}
