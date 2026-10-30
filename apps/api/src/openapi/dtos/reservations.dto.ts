import { ApiProperty } from "@nestjs/swagger";

export class ReservationCreatorDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  displayName!: string;
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
}

export class ReservationVoteDto {
  @ApiProperty({ type: String, enum: ["APPROVE", "REJECT"] })
  choice!: "APPROVE" | "REJECT";
}
