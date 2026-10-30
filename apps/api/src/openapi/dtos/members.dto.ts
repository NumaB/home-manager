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
}
