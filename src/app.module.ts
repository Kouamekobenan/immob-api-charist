import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/auth/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { ExpensesModule } from './modules/expenses/expenses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    ContractsModule,
    TicketsModule,
    PaymentsModule,
    AuditLogsModule,
    CloudinaryModule,
    ExpensesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
