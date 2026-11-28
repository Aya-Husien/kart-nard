import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req,
  UnauthorizedException, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiCookieAuth, ApiOperation, ApiCreatedResponse, ApiOkResponse,
  ApiBadRequestResponse, ApiUnauthorizedResponse, ApiNotFoundResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import '../auth/session.types.js';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { ApiResponseDto } from '../../common/dto/api-response.dto.js';
import { AddressesService } from './addresses.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

@ApiTags('Addresses')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ type: ApiResponseDto })
@ApiBadRequestResponse({ type: ApiResponseDto })
@UseGuards(SessionGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create my address' })
  @ApiCreatedResponse({ type: ApiResponseDto })
  create(@Req() req: Request, @Body() dto: CreateAddressDto) {
    return this.addresses.create(this.userId(req), dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my addresses' })
  @ApiOkResponse({ type: ApiResponseDto })
  findAll(@Req() req: Request) {
    return this.addresses.findAll(this.userId(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get my address by ID' })
  @ApiOkResponse({ type: ApiResponseDto })
  @ApiNotFoundResponse({ type: ApiResponseDto })
  findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.addresses.findOne(this.userId(req), id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update my address' })
  @ApiOkResponse({ type: ApiResponseDto })
  @ApiNotFoundResponse({ type: ApiResponseDto })
  update(@Req() req: Request, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAddressDto) {
    return this.addresses.update(this.userId(req), id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete my address' })
  @ApiOkResponse({ type: ApiResponseDto })
  @ApiNotFoundResponse({ type: ApiResponseDto })
  remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.addresses.remove(this.userId(req), id);
  }

  private userId(req: Request): number {
    const userId = req.session?.userId;
    if (!userId) throw new UnauthorizedException();
    return userId;
  }
}
