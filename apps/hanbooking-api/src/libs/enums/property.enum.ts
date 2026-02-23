import { registerEnumType } from '@nestjs/graphql';

export enum PropertyType {
  HOTEL = 'Hotel',
  RESORT = 'Resort',
  HOSTEL = 'Hostel',
}
registerEnumType(PropertyType, {
  name: 'PropertyType',
});

export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  BOOKED = 'BOOKED',
  DELETE = 'DELETE',
}
registerEnumType(PropertyStatus, {
  name: 'PropertyStatus',
});

export enum PropertyLocation {
  SEOUL = 'Seoul',
  BUSAN = 'Busan',
  INCHEON = 'Incheon',
  DAEGU = 'Daegu',
  DAEJON = 'Daejon',
  GWANGJU = 'Gwangju',
  ULSAN = 'Ulsan',
  SEJONG = 'Sejong',
  GYEONGGI = 'Gyeonggi-do',
  GANGWON = 'Gangwon-do',
  CHUNGCHEONGBUK = 'Chungcheongbuk-do',
  CHUNGCHEONGNAM = 'Chungcheongnam-do',
  JEOLLABUK = 'Jeollabuk-do',
  JEOLLANAM = 'Jeollanam-do',
  GYEONGSANGBUK = 'Gyeongsangbuk-do',
  GYEONGSANGNAM = 'Gyeongsangnam-do',
  JEJU = 'Jeju',
}
registerEnumType(PropertyLocation, {
  name: 'PropertyLocation',
});

export enum PropertyAmenity {
  WIFI = 'wifi',
  POOL = 'pool',
  BREAKFAST = 'breakfast',
  PARKING = 'parking',
  AC = 'ac',
  GYM = 'gym',
}
registerEnumType(PropertyAmenity, {
  name: 'PropertyAmenity',
});
