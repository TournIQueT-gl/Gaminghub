import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, Min, Max, IsInt, IsObject, IsArray } from 'class-validator';
import { TournamentFormat, TournamentType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateTournamentDto {
  @ApiProperty({ description: 'Tournament name' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, description: 'Tournament description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Game title' })
  @IsString()
  game: string;

  @ApiProperty({ description: 'Maximum number of participants', minimum: 2, maximum: 256 })
  @IsInt()
  @Min(2)
  @Max(256)
  maxParticipants: number;

  @ApiProperty({ required: false, description: 'Entry fee in USD' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  entryFee?: number;

  @ApiProperty({ required: false, description: 'Prize pool in USD' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  prizePool?: number;

  @ApiProperty({ enum: TournamentFormat, default: TournamentFormat.SINGLE_ELIMINATION })
  @IsOptional()
  @IsEnum(TournamentFormat)
  format?: TournamentFormat;

  @ApiProperty({ enum: TournamentType, default: TournamentType.SOLO })
  @IsOptional()
  @IsEnum(TournamentType)
  type?: TournamentType;

  @ApiProperty({ description: 'Tournament start date and time' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ required: false, description: 'Tournament end date and time' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateTournamentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  game?: string;

  @ApiProperty({ required: false, minimum: 2, maximum: 256 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(256)
  maxParticipants?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  entryFee?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  prizePool?: number;

  @ApiProperty({ required: false, enum: TournamentFormat })
  @IsOptional()
  @IsEnum(TournamentFormat)
  format?: TournamentFormat;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class JoinTournamentDto {
  @ApiProperty({ required: false, description: 'Team ID for team tournaments' })
  @IsOptional()
  @IsInt()
  teamId?: number;
}

export class CreateTeamDto {
  @ApiProperty({ description: 'Team name' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, description: 'Team tag' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiProperty({ description: 'Tournament ID' })
  @IsInt()
  tournamentId: number;

  @ApiProperty({ description: 'Member user IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  memberIds: string[];
}

export class SubmitMatchResultDto {
  @ApiProperty({ description: 'Winner participant ID' })
  @IsInt()
  winnerId: number;

  @ApiProperty({ required: false, description: 'Match score data' })
  @IsOptional()
  @IsObject()
  score?: any;
}