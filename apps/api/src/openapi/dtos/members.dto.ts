import { ApiProperty } from "@nestjs/swagger";

export class CurrentMemberResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String, enum: ["USER", "ADMIN"] })
  role!: "USER" | "ADMIN";

  @ApiProperty({ type: Boolean })
  isActive!: boolean;

  @ApiProperty({ type: String })
  displayName!: string;

  @ApiProperty({
    type: String,
    pattern: "^#[0-9A-Fa-f]{6}$",
    example: "#C72424",
  })
  reservationColor!: string;
}

export class UpdateDisplayNameDto {
  @ApiProperty({
    type: String,
    minLength: 1,
    maxLength: 80,
    example: "Camille",
  })
  displayName!: string;
}

export class UpdateReservationColorDto {
  @ApiProperty({
    type: String,
    pattern: "^#[0-9A-Fa-f]{6}$",
    example: "#C72424",
  })
  reservationColor!: string;
}
