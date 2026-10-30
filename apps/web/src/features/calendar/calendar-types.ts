import type { components } from "@generated/api-schema";

export type VoteChoice = components["schemas"]["ReservationVoteDto"]["choice"];
export type Reservation = components["schemas"]["ReservationResponseDto"];
export type CurrentMember = components["schemas"]["CurrentMemberResponseDto"];

export type ModalState =
  | { type: "create" }
  | { type: "details"; reservation: Reservation };

export type Translate = (
  key: string,
  options?: Record<string, unknown>,
) => string;

export type ApiClient = <T>(path: string, init?: RequestInit) => Promise<T>;
