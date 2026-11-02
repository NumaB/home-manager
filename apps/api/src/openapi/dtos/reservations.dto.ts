import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ReservationCreatorDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  displayName!: string;

  @ApiProperty({
    type: String,
    pattern: "^#[0-9A-Fa-f]{6}$",
    example: "#C72424",
  })
  reservationColor!: string;
}

export class ReservationResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String, example: "2026-10-28", format: "date" })
  startDate!: string;

  @ApiProperty({ type: String, example: "2026-10-30", format: "date" })
  endDate!: string;

  @ApiProperty({ type: String, enum: ["PENDING", "APPROVED"] })
  status!: "PENDING" | "APPROVED";

  @ApiProperty({ type: String, format: "date-time" })
  createdAt!: string;

  @ApiProperty({ type: String, nullable: true })
  title!: string | null;

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;

  @ApiProperty({ type: ReservationCreatorDto })
  creator!: ReservationCreatorDto;

  @ApiProperty({ type: Number, minimum: 0 })
  approvals!: number;

  @ApiProperty({ type: Number, minimum: 0 })
  rejections!: number;

  @ApiProperty({ type: Number, minimum: 0 })
  totalEligibleVoters!: number;

  @ApiProperty({
    type: String,
    enum: ["APPROVE", "REJECT"],
    nullable: true,
  })
  currentMemberVote!: "APPROVE" | "REJECT" | null;
}

export class ReservationDatesDto {
  @ApiProperty({
    type: String,
    format: "date",
    pattern: "^\\d{4}-\\d{2}-\\d{2}$",
  })
  startDate!: string;

  @ApiProperty({
    type: String,
    format: "date",
    pattern: "^\\d{4}-\\d{2}-\\d{2}$",
  })
  endDate!: string;

  @ApiPropertyOptional({ type: String })
  title?: string;

  @ApiPropertyOptional({ type: String })
  description?: string;
}

export class ReservationVoteDto {
  @ApiProperty({ type: String, enum: ["APPROVE", "REJECT"] })
  choice!: "APPROVE" | "REJECT";
}

export class BookingSettingsResponseDto {
  @ApiProperty({ type: Boolean })
  approvalEnabled!: boolean;
}

export class UpdateBookingSettingsDto {
  @ApiProperty({ type: Boolean })
  approvalEnabled!: boolean;
}
