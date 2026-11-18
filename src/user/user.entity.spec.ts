import * as argon2 from 'argon2';
import { UserEntity } from './user.entity';

describe('UserEntity (argon2 password hashing)', () => {
  it('hashes the plaintext password on insert and verifies against it', async () => {
    const user = new UserEntity();
    user.password = 'jakejake';

    await user.hashPassword();

    expect(user.password).not.toBe('jakejake');
    await expect(argon2.verify(user.password, 'jakejake')).resolves.toBe(true);
    await expect(argon2.verify(user.password, 'wrong-password')).resolves.toBe(false);
  });
});
