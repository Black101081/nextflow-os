import { ParamsDictionary } from 'express-serve-static-core';
import qs from 'qs';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      userId?: string;
      role?: string;
    }
  }
}
