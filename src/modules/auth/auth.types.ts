import { Role } from '@prisma/client';

export interface RegisterTenantInput {
  agencyName: string;
  slug: string;
  fullName: string;
  email: string;
  password?: string;
}

export interface LoginInput {
  email: string;
  password?: string;
}

export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: Role;
  name: string;
  email: string;
}
