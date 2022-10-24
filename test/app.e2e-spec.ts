import { INestApplication } from '@nestjs/common/interfaces';
import { ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3300);

    prisma = app.get(PrismaService);
    await prisma.clearDB();

    pactum.request.setBaseUrl('http://localhost:3300');
  });
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'teslim@gmail.com',
      password: '1234567',
    };
    describe('Signup', () => {
      it('should throw an error if email is missing', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw an error if password is missing', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('it should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Sigin', () => {
      it('should throw an error if email is missing', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw an error if password is missing', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get current user', () => {
      it('should return current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .inspect();
      });
    });
    describe('Edit User', () => {
      const dto: EditUserDto = {
        email: 'teslim@gmail.com',
      };
      it('should edit user by id', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .inspect();
      });
    });
  });

  describe('Bookmarks', () => {
    describe('get empty bookmark', () => {
      it('should return empty bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'A title',
        description: 'A description',
        link: 'A link',
      };
      it('should create a bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .inspect()
          .stores('bookmarkid', 'id');
      });
    });
    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1)
          .inspect();
      });
    });
    describe('Get bookmark by id', () => {
      it('should get a bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withPathParams('id', '$S{bookmarkid}')
          .expectStatus(200);
      });
    });
    describe('Edit bookmark by Id', () => {
      const dto: EditBookmarkDto = {
        title: 'a title of the bookmark',
        description: 'a description of the bookmark',
        link: 'the link to the bookmark',
      };
      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withPathParams('id', '$S{bookmarkid}')
          .withBody(dto)
          .expectStatus(200);
      });
    });
    describe('Delete bookmark by Id', () => {
      it('should delete a bookmark by Id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '${bookmarkid}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });
      it('should return empty bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
