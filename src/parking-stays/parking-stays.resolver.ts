import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ParkingMessage } from './dto/create-parking-stay.dto';
import { ParkingStaysService } from './parking-stays.service';

@Resolver()
export class ParkingStaysResolver {
  constructor(private parkingStayService: ParkingStaysService) {}

  @Mutation((returns) => Boolean)
  async postParkingStayMessage(@Args('createUserData') test: ParkingMessage) {
    return await this.parkingStayService.postMessageParkingStayQueue(test);
  }
}
