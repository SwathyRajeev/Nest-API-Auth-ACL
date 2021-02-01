
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EntityRepository, Repository } from 'typeorm';
import { randomName } from '../utilities/unique.name.generator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(createUserDto: CreateUserDto): Promise<string> {
    const { user_name, password, name,roles } = createUserDto;

    const auth = new User();
    auth.user_id = randomName('USER');
    auth.user_name = user_name;
    auth.name = name;
    auth.roles = roles;

    // for ( let i = 0; i < roles.length ; i++)
    // {
    //   console.log(roles[i])
    //         //  const genre = await GenreEntity.findOne(genreIDs[i]);
    //         auth.roles.push(roles[i]);
    // }
   

    auth.salt = await bcrypt.genSalt();
    auth.password = await this.hashPassword(password, auth.salt);
    try {
      await auth.save();
      return await this.signIn(createUserDto);
    } catch (exception) {
      console.log(exception);
      if (exception.code === '23505') {
        throw new ConflictException(exception.detail);
      } else {
        throw new InternalServerErrorException(exception.detail);
      }
    }
  }

  private async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }

  async validateUserPassword(createUserDto: CreateUserDto): Promise<string> {
    const { user_name, password } = createUserDto;
    const auth = await this.findOne({ user_name });
    if (auth && await auth.validatePassword(password)) {
      return auth.user_id;
    }
    else {
      return null;
    }
  }

  async signIn(createUserDto: LoginUserDto): Promise<string> {
    const { user_name, password } = createUserDto;


    const auth = await this.findOne({ user_name });
    if (auth && auth.status) {
      return auth.user_id;
    } else {
      throw new InternalServerErrorException('Invalid username or password');
    }
  }


  // ['user_id', 'name', 'user_name', 'phone', 'email', 'create_date', 'status']
  async findAllUsers() {
    const query = this.createQueryBuilder('user')
      .select([
        'user.user_id',
        'user.name',
        'user.user_name',
        'user.phone',
        'user.photo',
        'user.email',
        'user.create_date',
        'user.status'

      ])
      .leftJoinAndSelect('user.roles', 'role')
      .where({ status: true });
    try {
      let data = await query.getMany();
      return data;
    } catch (err) {
      console.log(err);
      throw new NotFoundException(err);
    }
  }

  async findOneUser(id: string): Promise<User> {
    try {
      const query = this.createQueryBuilder('user')
        .select([
          'user.user_id',
          'user.name',
          'user.user_name',
          'user.phone',
          'user.photo',
          'user.email',
          'user.create_date',
          'user.status'
        ])
        .leftJoinAndSelect('user.roles', 'role')
        .where({ status: true, user_id: id });
      return await query.getOne();
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UpdateUserDto> {
    const query = this.createQueryBuilder();
    try {
      let userData = await this.findOneUser(id);
      userData.name = updateUserDto.name
      userData.phone = updateUserDto.phone
      userData.email = updateUserDto.email

      await query.update()
        .set(userData)
        .where({ user_id: id })
        .execute();
      return await this.findOneUser(id);
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  async removeUser(id: string): Promise<UpdateUserDto> {
    const query = this.createQueryBuilder();
    try {
      let userData = await this.findOneUser(id);
      userData.status = !userData.status;
      await query.update()
        .set(userData)
        .where({ user_id: id })
        .execute();
      return await this.findOneUser(id);
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  // async removeUser(id: string) {
  //   return `This action removes a #${id} auth`;
  // }

  async updatePhoto(
    filename: string,
    user: User,
  ): Promise<User> {

    let userData = await this.findOneUser(user.user_id);
    userData.photo = filename;
    userData.user_id = user.user_id;
    try {
      await userData.save();
      return userData;
    } catch (exception) {
      console.log(exception);
      throw new InternalServerErrorException(exception.detail);
    }
  }
}
