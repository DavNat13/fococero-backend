// Manual mock for firebase-admin to prevent Firebase initialization during tests
// Uses named exports to match the `import * as admin from "firebase-admin"` pattern

export const mockVerifyIdToken = jest.fn();
export const mockCreateCustomToken = jest.fn();
export const mockCreateUser = jest.fn();
export const mockGetUser = jest.fn();
export const mockGetUserByEmail = jest.fn();
export const mockUpdateUser = jest.fn();
export const mockDeleteUser = jest.fn();

const mockAuth = {
  verifyIdToken: mockVerifyIdToken,
  createCustomToken: mockCreateCustomToken,
  createUser: mockCreateUser,
  getUser: mockGetUser,
  getUserByEmail: mockGetUserByEmail,
  updateUser: mockUpdateUser,
  deleteUser: mockDeleteUser,
};

export const apps: any[] = [];
export const initializeApp = jest.fn();
export const credential = {
  cert: jest.fn(() => ({})),
  applicationDefault: jest.fn(),
};
export const auth = jest.fn(() => mockAuth);
