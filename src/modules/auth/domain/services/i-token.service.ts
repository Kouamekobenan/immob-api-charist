export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenService {
  generateTokenPair(payload: TokenPayload): Promise<TokenPair>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');
