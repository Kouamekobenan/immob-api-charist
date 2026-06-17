import { Injectable } from '@nestjs/common';
import { PrismaStatsService } from '../../infrastructure/prisma-stats.service';

@Injectable()
export class GetAlertesUseCase {
  constructor(private readonly statsService: PrismaStatsService) {}

  execute() {
    return this.statsService.getAlertes();
  }
}
