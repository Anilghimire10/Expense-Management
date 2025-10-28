export const jwtConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiration: '1y',
    refreshTokenExpiration: '1y',
  },
};

export default jwtConfig;
