import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 200 })
    statusCode!: number;

    @ApiProperty({ example: 'Request successful' })
    message!: string;

    @ApiProperty({
        type: 'object',
        additionalProperties: true,
        nullable: true,
    })
    data!: Record<string, unknown> | null;
}