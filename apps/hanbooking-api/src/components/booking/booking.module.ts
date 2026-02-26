import { Module } from '@nestjs/common';
import { BookingResolver } from './booking.resolver';
import { BookingService } from './booking.service';
import { MongooseModule } from '@nestjs/mongoose';
import BookingSchema from '../../schemas/Booking.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { PropertyModule } from '../property/property.module';
import PropertySchema from '../../schemas/Property.model';

@Module({
    imports: [
        MongooseModule.forFeature([
            { 
                name: 'Booking', 
                schema: BookingSchema,
            }
        ]),
        MongooseModule.forFeature([
            { 
                name: 'Property', 
                schema: PropertySchema,
            }
        ]),
        AuthModule,
        MemberModule,
        PropertyModule,
      ],
    providers: [BookingResolver, BookingService]
})
export class BookingModule {}
