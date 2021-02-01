import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { randomName } from 'src/utilities/unique.name.generator';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { GetUser } from './get-user.decorator';
import { AuthPayload } from './interface/auth.payload.interface';
import { JwtAuthGuard } from './jwt.guard';
import { RoleEnum } from './role.enum';
import { hasRoles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

import { diskStorage } from 'multer';
import { PROFILE_IMAGE_PATH } from './../utilities/strings.resource';
import path = require('path');
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable, of } from 'rxjs';
import { join } from 'path';

export const storage = {
  storage: diskStorage({
    destination: PROFILE_IMAGE_PATH,
    filename: (req, file, callback) => {
      const filename: string = randomName('Profile');
      const extension: string = path.parse(file.originalname).ext;
      callback(null, `${filename}${extension}`);
    },
  }),
};


@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService
  ) { }

  @Post('/signUp')
  signUp(@Body() authCredentialsDto: CreateUserDto): Promise<AuthPayload> {
    return this.authService.signUp(authCredentialsDto);
  }
  @Post('/signIn')
  signIn(@Body() authCredentialsDto: LoginUserDto): Promise<AuthPayload> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @hasRoles(RoleEnum.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get('test')
  findAllTest(@GetUser() user: User) {
    console.log(user);
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<UpdateUserDto> {
    return this.authService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateUserDto) {
    return this.authService.update(id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }



  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file, @GetUser() user: User): Promise<User> {
    try {
      console.log(`User creating a Profile. Data: ${JSON.stringify(user)}`);
      return this.authService.updatePhoto(file.filename, user);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Get('photo/:photo')
  findProfileImage(
    @Param('photo') photo,
    @Res() res,
  ): Observable<Object> {
    try {
      return of(
        res.sendFile(
          join(process.cwd(), PROFILE_IMAGE_PATH + '/' + photo),
        ),
      );
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

}
