import { ValidationPipe } from './validation.pipe';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

describe('ValidationPipe (class-validator / class-transformer)', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = new ValidationPipe();
  });

  it('passes through a valid payload transformed into the DTO class', async () => {
    const payload = { username: 'jake', email: 'jake@jake.jake', password: 'jakejake' };

    const result = await pipe.transform(payload, { metatype: CreateUserDto, type: 'body' });

    expect(result).toEqual(payload);
  });

  it('throws an HttpException when required fields are missing', async () => {
    const payload = { username: '', email: '', password: '' };

    await expect(
      pipe.transform(payload, { metatype: CreateUserDto, type: 'body' })
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('does not validate primitive metatypes', async () => {
    const result = await pipe.transform('jake', { metatype: String, type: 'param' });

    expect(result).toBe('jake');
  });
});
