import { Module } from '@nestjs/common';
import { ParkingStaysResolver } from './parking-stays.resolver';
import { ParkingStaysService } from './parking-stays.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MongooseModule } from '@nestjs/mongoose';
import { ParkingStay, ParkingStaySchema } from './models/parkint-stay.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ParkingStay.name, schema: ParkingStaySchema },
    ]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      // exchanges: [
      //   {
      //     name: 'exchange1',
      //     type: 'direct',
      //   },
      // ],
      uri: 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [ParkingStaysResolver, ParkingStaysService],
})
export class ParkingStaysModule {}
