import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copyu of the users service
    const fakeUsersService: Partial<UsersService> = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('everson@gmail.com', 'everson123');

    expect(user.password).not.toEqual('everson123');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async (done) => {
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);
    try {
      await service.signup('everson@gmail.com', 'everson123');
    } catch (err) {
      done();
    }
  });

  it('throws if signin is called with an unused email', async (done) => {
    try {
      await expect(
        service.signin('newemail@new.com', 'hardpassword123'),
      ).rejects.toThrow(NotFoundException);
    } catch (err) {
      done();
    }
  });

  it('throws if an invalid password is provided', async (done) => {
    fakeUsersService.find = () =>
      Promise.resolve([
        { email: 'everson@gmail.com', password: 'everson123' } as User,
      ]);

    try {
      await expect(
        service.signin('randomEmail@random.com', 'passowrd'),
      ).rejects.toThrow(BadRequestException);
    } catch (error) {
      done();
    }
  });
  it('returns a user if correct password is provided', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        { email: 'everson@gmail.com', password: 'everson123' } as User,
      ]);

    const user = await service.signin('everson@gmail.com', 'everson123');
    expect(user).toBeDefined();
  });
});
