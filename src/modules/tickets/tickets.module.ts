import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

import { TICKET_REPOSITORY } from './domain/repositories/i-ticket.repository';
import { PrismaTicketRepository } from './infrastructure/repositories/prisma-ticket.repository';

import { CreateTicketUseCase } from './application/use-cases/create-ticket.use-case';
import { GetTicketUseCase } from './application/use-cases/get-ticket.use-case';
import { GetAllTicketsUseCase } from './application/use-cases/get-all-tickets.use-case';
import { AssignTicketUseCase } from './application/use-cases/assign-ticket.use-case';
import { UpdateTicketStatusUseCase } from './application/use-cases/update-ticket-status.use-case';
import { AddPhotosUseCase } from './application/use-cases/add-photos.use-case';
import { DeleteTicketUseCase } from './application/use-cases/delete-ticket.use-case';

import { TicketsController } from './presentation/tickets.controller';

const useCases = [
  CreateTicketUseCase,
  GetTicketUseCase,
  GetAllTicketsUseCase,
  AssignTicketUseCase,
  UpdateTicketStatusUseCase,
  AddPhotosUseCase,
  DeleteTicketUseCase,
];

@Module({
  imports: [AuthModule, CloudinaryModule],
  controllers: [TicketsController],
  providers: [
    {
      provide: TICKET_REPOSITORY,
      useClass: PrismaTicketRepository,
    },
    ...useCases,
  ],
  exports: [TICKET_REPOSITORY],
})
export class TicketsModule {}
