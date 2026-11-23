import { execFileSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import 'reflect-metadata';

// This repo deliberately runs two different TypeScript compilers side by
// side (see package.json's typescript/@typescript/native deps, following
// ts-jest's official TypeScript 7 migration guide): the real TypeScript 7
// native/Go compiler builds production (`tsc`, aliased to
// `@typescript/native`), while ts-jest/ts-node use the classic TypeScript 6
// compatibility API (aliased to the `typescript` package name) because
// TypeScript 7 ships no JS compiler API for them to load. ts-jest's own
// transform therefore never exercises the compiler that actually builds
// `dist/`. This test invokes the real native `tsc` binary directly so a
// regression in either the alias wiring or the native compiler's decorator
// metadata emission (which this app's entire NestJS dependency-injection
// wiring relies on, e.g. src/user/user.service.ts) fails loudly here
// instead of silently shipping.

const FIXTURE_DIR = join(__dirname, '..', '..', 'test', 'ts7-decorator-fixture');
const OUT_DIR = join(FIXTURE_DIR, 'out');

describe('TypeScript 7 native compiler / compat alias wiring', () => {
  afterAll(() => {
    rmSync(OUT_DIR, { recursive: true, force: true });
  });

  it('resolves `typescript` to the classic TS6 compatibility API ts-jest/ts-node depend on', () => {
    const version = require('typescript/package.json').version as string;
    expect(version.startsWith('6.')).toBe(true);
  });

  it('resolves `@typescript/native` to the real TypeScript 7 compiler used for `tsc`/builds', () => {
    const version = require('@typescript/native/package.json').version as string;
    expect(version.startsWith('7.')).toBe(true);
  });

  it('compiles decorator metadata with the real native tsc the same way the app relies on for DI', () => {
    const tscBinary = join(
      require.resolve('@typescript/native/package.json'),
      '..',
      'bin',
      'tsc',
    );
    rmSync(OUT_DIR, { recursive: true, force: true });

    execFileSync(process.execPath, [tscBinary, '--project', FIXTURE_DIR], {
      stdio: 'pipe',
    });

    expect(existsSync(join(OUT_DIR, 'fixture.js'))).toBe(true);

    const { Consumer, Dependency } = require(join(OUT_DIR, 'fixture.js'));
    const paramTypes = Reflect.getMetadata('design:paramtypes', Consumer);

    expect(paramTypes).toEqual([Dependency]);
  });
});
