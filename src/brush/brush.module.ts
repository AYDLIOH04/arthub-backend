import { Module } from '@nestjs/common';
import { BrushController } from './brush.controller';
import { BrushService } from './brush.service';
import { FilesModule } from '../files/files.module';

@Module({
  controllers: [BrushController],
  providers: [BrushService],
  imports: [FilesModule],
})
export class BrushModule {}
