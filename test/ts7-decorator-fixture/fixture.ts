// Minimal stand-in for the @Injectable()/constructor-injection pattern this
// app's services and controllers rely on (e.g. src/user/user.service.ts),
// compiled standalone so the check never needs the gitignored src/config.ts.
function Injectable(): ClassDecorator {
  return () => {};
}

@Injectable()
export class Dependency {}

@Injectable()
export class Consumer {
  constructor(public readonly dependency: Dependency) {}
}
