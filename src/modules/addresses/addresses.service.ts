import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Address } from './models/address.model.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

@Injectable()
export class AddressesService {
  constructor(@InjectModel(Address) private readonly addresses: typeof Address) {}

  async create(userId: number, dto: CreateAddressDto) {
    const address = await this.addresses.create({
      user_id: userId,
      address: dto.address,
      city: dto.city,
      location: { latitude: dto.location.latitude, longitude: dto.location.longitude },
      notes: dto.notes ?? null,
    });
    return { message: 'Address created successfully', ...this.toData(address) };
  }

  async findAll(userId: number) {
    const addresses = await this.addresses.findAll({
      where: { user_id: userId },
      order: [['id', 'DESC']],
    });
    return { addresses: addresses.map(address => this.toData(address)) };
  }

  // Reusable ownership check for the Orders module.
  async findOwned(userId: number, id: number): Promise<Address> {
    this.validateId(id);
    const address = await this.addresses.findOne({ where: { id, user_id: userId } });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async findOne(userId: number, id: number) {
    return this.toData(await this.findOwned(userId, id));
  }

  async update(userId: number, id: number, dto: UpdateAddressDto) {
    this.validateId(id);
    const changes: Partial<Pick<Address, 'address' | 'city' | 'location' | 'notes'>> = {};
    if (dto.address !== undefined) changes.address = dto.address;
    if (dto.city !== undefined) changes.city = dto.city;
    if (dto.location !== undefined) {
      changes.location = { latitude: dto.location.latitude, longitude: dto.location.longitude };
    }
    if (dto.notes !== undefined) changes.notes = dto.notes;
    if (!Object.keys(changes).length) throw new BadRequestException('Provide at least one field to update');

    const [count, rows] = await this.addresses.update(changes, {
      where: { id, user_id: userId },
      returning: true,
    });
    const updated = rows[0];
    if (!count || !updated) throw new NotFoundException('Address not found');
    return { message: 'Address updated successfully', ...this.toData(updated) };
  }

  async remove(userId: number, id: number) {
    this.validateId(id);
    const count = await this.addresses.destroy({ where: { id, user_id: userId } });
    if (!count) throw new NotFoundException('Address not found');
    return { message: 'Address deleted successfully' };
  }

  private validateId(id: number) {
    if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
      throw new BadRequestException('Invalid address ID');
    }
  }

  private toData(address: Address) {
    return {
      id: address.id,
      address: address.address,
      city: address.city,
      location: address.location,
      notes: address.notes,
    };
  }
}
