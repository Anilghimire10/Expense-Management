import { Secret, SignOptions } from 'jsonwebtoken';

interface JwtConfig {
  jwt: {
    secret: Secret;
    accessTokenExpiration: SignOptions['expiresIn'];
    refreshTokenExpiration: SignOptions['expiresIn'];
  };
}

export const jwtConfig: JwtConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    accessTokenExpiration: '1y',
    refreshTokenExpiration: '1y',
  },
};

export default jwtConfig;
