import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt/dist';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    // hash the password
    const hash = await argon.hash(dto.password);
    try {
      //save to db
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      // return the verified user
      return this.signToken(user.id, user.email);
    } catch (error) {
      // handing dublicate email
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email exists already');
        }
      } else {
        throw error;
      }
    }
  }

  async signin(dto: AuthDto) {
    // check if user is a registered user
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // if user does not exist
    if (!user) {
      throw new ForbiddenException('user is not a registered user');
    }

    //if user is a registered user then compare password
    const pswd = await argon.verify(user.hash, dto.password);

    // if password does not match
    if (!pswd) {
      throw new ForbiddenException('password is incorrect');
    }

    // delete password from the response data
    // delete user.hash;

    // return the verified user
    return this.signToken(user.id, user.email);
  }

  // secret
  // generate token
  signToken = async (
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> => {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  };
}
