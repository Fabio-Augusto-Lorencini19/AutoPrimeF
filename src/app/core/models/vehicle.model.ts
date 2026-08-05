export type StatusVeiculo = 'disponivel' | 'vendido' | 'reservado';

export interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  quilometragem: number;
  chassi: string;
  status: StatusVeiculo;
  imagemUrl: string;
  combustivel?: string;
  cambio?: string;
  cor?: string;
  descricao?: string;
  destaque?: boolean;
}

