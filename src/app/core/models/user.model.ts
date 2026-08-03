export type Papel = 'admin' | 'vendedor';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegistroPayload {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginResponse {
  usuario: Usuario;
  token: string;
}
