import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PaymentLinkModule } from './payment-link/payment-link.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => {
        const mongoURL = process.env.MONGO_URL; // hide mongo url in .env
        if (!mongoURL) throw new Error('MONGO_URI is not defined');
        return {
          uri: mongoURL,
        };
      },
    }),
    AuthModule,
    PaymentLinkModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
