import { AuthGuard } from '@nestjs/passport';

export class Jwt extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
