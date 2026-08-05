export type Cargo = 'gerente' | 'vendedor' | 'admin';
export type Papel = Cargo;

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  cargo: Cargo;
  papel: Papel;
  ativo: boolean;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegistroPayload {
  nome: string;
  email: string;
  senha: string;
  cargo?: Cargo;
}

export interface LoginResponse {
  usuario: Usuario;
  token: string;
}

