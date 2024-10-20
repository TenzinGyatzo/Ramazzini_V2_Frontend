export interface Logotipo {
    data: string;
    contentType: string;
  }
  
export interface Empresa {
_id: string;
nombreComercial: string;
razonSocial: string;
RFC: string;
giroDeEmpresa?: string;
logotipoEmpresa?: Logotipo;
baseOperaciones: 'Pruebas' | 'Los Mochis' | string;  // Los valores posibles
createdBy: string;
updatedBy: string;
createdAt: Date | string;
updatedAt: Date | string;
}