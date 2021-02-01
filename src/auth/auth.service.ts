import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './auth.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AuthPayload } from './interface/auth.payload.interface';
import { JwtPayload } from './interface/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) { }

  async findAll() {
    try {
      return await this.userRepository.findAllUsers();
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  async findOne(id: string): Promise<UpdateUserDto> {
    try {
      return await this.userRepository.findOneUser(id);
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  async update(id: string, updateAuthDto: UpdateUserDto) {
    try {
      return await this.userRepository.updateUser(id, updateAuthDto);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async remove(id: string) {
    return `This action removes a #${id} auth`;
  }

  async signUp(authCredentialsDto: CreateUserDto): Promise<AuthPayload> {
    try {
      const user_id = await this.userRepository.signUp(authCredentialsDto);
      const data = await this.generateAccessToken(user_id, 'user', true);
      return data;
    } catch (exception) {
      console.log(exception);
      throw new InternalServerErrorException(exception);
    }
  }

  async signIn(authCredentialsDto: LoginUserDto): Promise<AuthPayload> {
    try {
      const user_id = await this.userRepository.signIn(authCredentialsDto);
      return this.generateAccessToken(user_id, 'user', false);
    } catch (exception) {
      console.log(exception);
      throw new InternalServerErrorException(exception);
    }
  }


  async generateAccessToken(
    user_id: string,
    role: string,
    newUser: boolean,
  ): Promise<AuthPayload> {
    if (user_id) {
      const payload: JwtPayload = {
        user_id,
        role,
      };
      const accessToken = await this.jwtService.sign(payload);
      return {
        user_id,
        accessToken,
        newUser,
        role
      };
    } else {
      throw new UnauthorizedException('Invalid Credential');
    }
  }

  async updatePhoto(
    filename: string,
    user: User,
): Promise<User> {
    try {
        return this.userRepository.updatePhoto(filename, user);
    } catch (err) {
        throw new InternalServerErrorException(err.detail);
    }
}
}
