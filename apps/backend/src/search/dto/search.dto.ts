import { ApiProperty } from '@nestjs/swagger';

export enum SearchType {
  USER = 'user',
  CLAN = 'clan', 
  TOURNAMENT = 'tournament',
}

export class SearchResultDto {
  @ApiProperty()
  users?: {
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  @ApiProperty()
  clans?: {
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  @ApiProperty()
  tournaments?: {
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}