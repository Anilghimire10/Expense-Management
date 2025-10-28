import { IUser } from '../models/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Now req.user is typed as IUser | undefined
    }
  }
}
