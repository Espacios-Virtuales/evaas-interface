// src/app/core/models/software.model.ts
import { Provider } from './provisions.model';

export interface SoftwareItemRaw {
  id: string;
  name: string;
  version?: string;
  slug?: string;
  homepage?: string;
  npm?: string;
  provider?: Provider; // opcional: vincula el proveedor al software
}

export interface SoftwareItem extends SoftwareItemRaw {
  displayName: string;                 // Ejemplo: "Angular 20"
  actions: {
    createProject: boolean;            // habilita o desactiva el botón "Crear proyecto"
  };
}
