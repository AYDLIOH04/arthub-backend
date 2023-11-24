import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { FilesModule } from '../files/files.module';
import { ProgramController } from './program.controller';

@Module({
  controllers: [ProgramController],
  providers: [ProgramService],
  imports: [FilesModule],
})
export class ProgramModule {}
