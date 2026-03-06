import { registerEnumType } from '@nestjs/graphql';

export enum PropertyType {
  HOTEL = 'HOTEL',
	RESORT = 'RESORT',
	HOSTEL = 'HOSTEL'
}
registerEnumType(PropertyType, {
  name: 'PropertyType',
});

export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DELETE = 'DELETE',
}
registerEnumType(PropertyStatus, {
  name: 'PropertyStatus',
});

export enum PropertyLocation {
  SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	DAEJON = 'DAEJON',
	GWANGJU = 'GWANGJU',
  ULSAN = 'ULSAN',
  SEJONG = 'SEJONG',
  GYEONGGI = 'GYEONGGI',
  GANGWON = 'GANGWON',
  CHUNGCHEONGBUK = 'CHUNGCHEONGBUK',
  CHUNGCHEONGNAM = 'CHUNGCHEONGNAM',
  JEOLLABUK = 'JEOLLABUK',
  JEOLLANAM = 'JEOLLANAM',
  GYEONGSANGBUK = 'GYEONGSANGBUK',
  GYEONGSANGNAM = 'GYEONGSANGNAM',
	JEJU = 'JEJU',
}
registerEnumType(PropertyLocation, {
  name: 'PropertyLocation',
});

export enum PropertyAmenity {
 WIFI = 'WIFI',
	POOL = 'POOL',
	BREAKFAST = 'BREAKFAST',
	PARKING = 'PARKING',
	AC = 'AC',
	GYM = 'GYM',
}
registerEnumType(PropertyAmenity, {
  name: 'PropertyAmenity',
});
