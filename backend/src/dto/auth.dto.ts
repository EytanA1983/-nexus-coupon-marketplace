/**
 * Admin Login DTOs
 */

export interface AdminLoginRequestDto {
  username: string;
  password: string;
}

export interface AdminLoginResponseDto {
  token: string;
}
