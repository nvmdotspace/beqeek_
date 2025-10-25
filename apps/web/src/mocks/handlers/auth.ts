import { http, HttpResponse } from 'msw';
import { mockStore } from '../data/store';
import { LoginRequest, AuthTokens, RefreshTokenRequest } from '../types';

export const authHandlers = [
  // POST /api/auth/post/authenticate
  http.post('*/api/auth/post/authenticate', async ({ request }) => {
    try {
      const body = (await request.json()) as LoginRequest;
      const { username, password } = body;

      // Find user by username
      const user = mockStore.getUserByUsername(username);

      if (!user) {
        return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }

      // Simple password validation (in real app, this would be hashed)
      if (password !== 'nvmteam') {
        return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }

      // Generate tokens
      const accessToken = mockStore.createToken(user.id);
      const refreshToken = mockStore.createToken(user.id);

      const response: AuthTokens = {
        userId: user.id,
        accessToken,
        refreshToken,
      };

      return HttpResponse.json(response);
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),

  // POST /api/auth/post/refresh_token
  http.post('*/api/auth/post/refresh_token', async ({ request }) => {
    try {
      const body = (await request.json()) as RefreshTokenRequest;
      const { refreshToken } = body;

      // Validate refresh token
      const userId = mockStore.validateToken(refreshToken);

      if (!userId) {
        return HttpResponse.json({ message: 'Refresh token expired or invalid' }, { status: 401 });
      }

      // Generate new tokens
      const accessToken = mockStore.createToken(userId);
      const newRefreshToken = mockStore.createToken(userId);

      const response: AuthTokens = {
        userId,
        accessToken,
        refreshToken: newRefreshToken,
      };

      return HttpResponse.json(response);
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),
];
