import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(email: string, password: string): Promise<User> {
    const user = this.usersRepository.create({ email, password });

    return await this.usersRepository.save(user);
  }

  async findOne(id: number) {
    return await this.usersRepository.findOneBy({ id });
  }

  async find(email: string) {
    const user = await this.usersRepository.find({ where: { email } });

    if (!user) {
      throw new NotFoundException('User with that e-mail was not found');
    }

    return user;
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not Found');
    }

    Object.assign(user, attrs);

    return await this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.usersRepository.remove(user);
  }
}
