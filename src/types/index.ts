export type StatusConsulta = 'Agendado' | 'Concluido' | 'Atrasado';

export interface Responsavel {
  id_responsavel: number;
  id_usuario_dono: number;
  cpf_responsavel: string;
  nm_responsavel: string;
  nr_telefone_responsavel: string;
}

export interface Animal {
  id_animal: number;
  rg_animal: string | null;
  nr_microchip_animal: string | null;
  nm_animal: string;
  dt_nascimento_animal: string | null; // ISO date string
  peso_animal: number | null;
  especie_animal: string;
  raca_animal: string | null;
  id_responsavel: number;
}

export interface Consulta {
  id_consulta: number;
  historico_consulta: string;
  st_consulta: StatusConsulta;
  dt_consulta: string; // ISO date string
  hr_consulta: string; // "HH:MM"
  id_animal: number;
}

// Corpo esperado no POST /responsaveis (id_usuario_dono vem do token, não do body)
export interface CriarResponsavelBody {
  cpf_responsavel: string;
  nm_responsavel: string;
  nr_telefone_responsavel: string;
}

// Corpo esperado no POST /animais
export interface CriarAnimalBody {
  nm_animal: string;
  especie_animal: string;
  raca_animal?: string;
  dt_nascimento_animal?: string;
  peso_animal?: number;
  rg_animal?: string;
  nr_microchip_animal?: string;
  id_responsavel: number;
}

// Corpo esperado no POST /consultas
export interface CriarConsultaBody {
  historico_consulta: string;
  dt_consulta: string;
  hr_consulta: string;
  st_consulta?: StatusConsulta;
  id_animal: number;
}

// Corpo esperado no PUT /consultas/:id
export interface AtualizarConsultaBody {
  historico_consulta: string;
  dt_consulta: string;
  hr_consulta: string;
  st_consulta: StatusConsulta;
}

// Estende o Request do Express para carregar o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      uid?: string;
    }
  }
}