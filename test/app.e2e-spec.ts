import { AppModule } from '../src/app.module';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto, LoginDto } from '../src/auth/dto';
import * as pactum from 'pactum';
import { EditUserDto } from '../src/user/dto';
import { CreateNoteDto, EditNoteDto } from '../src/note/dto';

describe('app e2e', () => {
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
    await app.listen(3000);
    // get the prisma service to clean the database
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Register', () => {
      it('should throw an exception if the email is empty', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({
            password: '123456',
          })
          .expectStatus(400);
      });
      it('should throw an exception if the password is empty', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({
            email: 'user@email.com',
          })
          .expectStatus(400);
      });
      it('should throw an exception if the name is empty', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({
            name: 'final boss',
          })
          .expectStatus(400);
      });
      it('should register successfully', () => {
        const dto: AuthDto = {
          name: 'John Doe',
          email: 'johndoe@gmail.com',
          password: '123456',
        };
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Login', () => {
      it('should throw an exception if the email is incorrect', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'sam@email.com',
          })
          .expectStatus(400);
      });
      it('should throw an exception if the password is incorrect', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: 'sam@password.com',
          })
          .expectStatus(400);
      });
      it('should login successfully', () => {
        const dto: LoginDto = {
          email: 'johndoe@gmail.com',
          password: '123456',
        };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });
  describe('User', () => {
    describe('Get current user', () => {
      it('should get the current user ', () => {
        return (
          pactum
            .spec()
            .get('/users/me')
            // Added the bearer token here
            .withHeaders({
              Authorization: 'Bearer $S{userAt}',
            })
            .expectStatus(200)
        );
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          name: 'update user',
          email: 'updateuser@email.com',
        };
        return (
          pactum
            .spec()
            .patch('/users')
            // Added the bearer token here
            .withHeaders({
              Authorization: 'Bearer $S{userAt}',
            })
            .withBody(dto)
            .expectStatus(200)
            .expectBodyContains(dto.name)
            .expectBodyContains(dto.email)
        );
      });
    });
  });

  describe('Notes', () => {
    describe('get empty notes', () => {
      it('should get an empty array of notes', () => {
        return (
          pactum
            .spec()
            .get('/notes')
            // Added the bearer token here
            .withHeaders({
              Authorization: 'Bearer $S{userAt}',
            })
            .expectStatus(200)
            .expectBody([])
        );
      });
    });

    describe('create a note', () => {
      it('should create a note successfully', () => {
        const dto: CreateNoteDto = {
          title: 'New note',
          description: 'this is the description for the new note',
        };

        return pactum
          .spec()
          .post('/notes')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .stores('noteId', 'id');
      });
    });

    describe('get  notes', () => {
      it('should get notes', () => {
        return (
          pactum
            .spec()
            .get('/notes')
            // Added the bearer token here
            .withHeaders({
              Authorization: 'Bearer $S{userAt}',
            })
            .expectStatus(200)
        );
      });
    });

    describe('get a note', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/notes/{id}')
          .withPathParams('id', '$S{noteId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{noteId}');
      });
    });

    describe('edit note', () => {
      it('should be able to edit note', () => {
        const dto: EditNoteDto = {
          title: 'updated note',
          description: 'this is the description for the updated note',
        };

        return pactum
          .spec()
          .patch('/notes/{id}')
          .withPathParams('id', '$S{noteId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('delete note', () => {
      it('should be able to delete a note', () => {
        return pactum
          .spec()
          .delete('/notes/{id}')
          .withPathParams('id', '$S{noteId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });
    });
    it('should get an empty array of notes', () => {
      return (
        pactum
          .spec()
          .get('/notes')
          // Added the bearer token here
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0)
      );
    });
  });
});
