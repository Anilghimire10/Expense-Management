export const jwtConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'ultrasecretkey',
    accessTokenExpiration: '1y', // 1 year for access tokens
    refreshTokenExpiration: '1y', // 1 year for refresh tokens
  },
};

export default jwtConfig;
