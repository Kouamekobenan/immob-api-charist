import { Injectable } from '@nestjs/common';
import { PrismaStatsService } from '../../infrastructure/prisma-stats.service';

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(private readonly statsService: PrismaStatsService) {}

  execute() {
    return this.statsService.getDashboardStats();
  }
}
