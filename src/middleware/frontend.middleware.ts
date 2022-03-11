import { Injectable, NestMiddleware } from '@nestjs/common';
import * as path from 'path';

const allowedExt = [
  '.js',
  '.ico',
  '.css',
  '.png',
  '.jpg',
  '.woff2',
  '.woff',
  '.ttf',
  '.svg',
];

const resolvePath = (file: string) => path.resolve(`./client/build/${file}`);

@Injectable()
export class FrontendMiddleware implements NestMiddleware {
  use(req, res, next) {
    const { url } = req;
    if (allowedExt.filter((ext) => url.indexOf(ext) > 0).length > 0) {
      res.sendFile(resolvePath(url));
    } else {
      res.sendFile('./client/build', { root: './' });
    }
  }
}
