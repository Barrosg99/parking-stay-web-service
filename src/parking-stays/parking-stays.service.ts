import {
  AmqpConnection,
  RabbitRPC,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ParkingMessage } from './dto/create-parking-stay.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ParkingStay } from './models/parkint-stay.model';
import { Model } from 'mongoose';

@Injectable()
export class ParkingStaysService {
  constructor(
    @InjectModel(ParkingStay.name) private parkingStayModel: Model<ParkingStay>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @RabbitSubscribe({
    exchange: '',
    routingKey: 'parking.stay.queue',
    queue: 'parking.stay.queue',
  })
  public async processParkingStay(msg: ParkingMessage) {
    // console.log('subscribe', msg);

    const parkingStay = await this.parkingStayModel.create(msg);

    const response = await this.amqpConnection.request<any>({
      exchange: '',
      routingKey: 'vehicle.queue',
      payload: { licensePlate: msg.licensePlate },
    });
    // console.log('response ', response);

    const { userId, vehicleId, paymentMethod } = response;

    parkingStay.vehicleId = vehicleId;
    parkingStay.userId = userId;
    await parkingStay.save();

    // publish mensagem na fila de pagamento
    const paymentMessage = {
      userId,
      parkingStaysId: parkingStay.id,
      paymentMethod,
    };

    await this.amqpConnection.publish(
      '',
      'parking.payment.queue',
      paymentMessage,
    );
  }

  // @RabbitRPC({
  //   exchange: 'exchange1',
  //   routingKey: 'vehicle_queue',
  //   queue: 'vehicle_queue',
  // })
  // public async rpcHandler2(msg) {
  //   console.log('rpc', msg);

  //   return {
  //     response: 42,
  //   };
  // }

  async postMessageParkingStayQueue(payload: ParkingMessage) {
    return await this.amqpConnection.publish('', 'parking.stay.queue', payload);

    // const response = await this.amqpConnection.request<any>({
    //   exchange: 'exchange1',
    //   routingKey: 'vehicle_queue',
    //   payload,
    //   // timeout: 10000, // optional timeout for how long the request
    //   // should wait before failing if no response is received
    // });
    // console.log('response ', response);
  }
}
