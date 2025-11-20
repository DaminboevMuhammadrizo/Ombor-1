export interface Car {
  id: string;
  moshina_nomeri: string;
  createdAt: Date;
}

export interface SparePart {
  id: string;
  nomi: string;
  kod: string;
  soni: number;
  narxi: number;
  kelgan_sanasi: Date;
}

export interface Order {
  id: string;
  moshina_nomeri: string;
  description: string;
  usta_haqi?: number;
  sanasi: Date;
  zapchast_soni: number;
  car?: Car;
}
