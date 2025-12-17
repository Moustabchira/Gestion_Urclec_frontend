export interface Agence {
  id: number;
  nom_agence: string;
  code_agence: string;
  ville: string;
  users?: User[];        // liste des utilisateurs rattachés à l'agence
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Poste {
  id: number;
  nom: string;
  users?: User[];
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface PointDeService {
  id: number;
  nom: string;

  // Relation vers Agence
  agenceId: number;
  agence?: Agence;

  affectationsOrigine?: AffectationEquipement[];
  affectationsDest?: AffectationEquipement[];
  
  // Métadonnées communes
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}


export interface User {
  id: number;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  password: string;
  code_identifiant: string;
  avatar?: string | null;
  agenceId: number;
  agence?: Agence;
  posteId: number;
  poste?: Poste;
  chefId?: number | null;
  chef?: User | null;
  subordonnes?: User[]; // utilisateurs dont cet utilisateur est le chef
  createdAt: Date;
  updatedAt: Date;
  actionCredits?: ActionCredit[];
  decisions?: Decision[];
  equipementsPossedes?: Equipement[];
  affectations?: AffectationEquipement[];
  evenements?: Evenement[];
  roles?: UserRole[];
  permissions?: string[];
  demandes?: Demande[];
  archive: boolean;
  archivedAt?: Date | null;
}


export interface Role {
  id: number;
  nom: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  permissions?: RolePermission[];
  userRoles?: UserRole[];
  archive: boolean;
  archivedAt?: Date | null;
}

export type RoleName = "DRH" | "EMPLOYE" | "DG";

export interface UserRole {
  userId: number;
  roleId: number;
  assignedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
  role?: Role;
  user?: User;
}

export interface Permission {
  id: number;
  nom: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  roles?: RolePermission[];
  archive: boolean;
  archivedAt?: Date | null;
}

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  createdAt: Date;
  permission?: Permission;
  role?: Role;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Decision {
  id: number;
  status: string;
  niveau: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  demandeId: number;
  demande?: Demande;
  user?: User;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Demande {
  id: number;
  type: string;
  dateDebut: Date;
  dateFin: Date;
  motif: string;
  status: string; // "EN_ATTENTE" | "APPROUVEE" | "REFUSEE"
  createdAt: Date;
  updatedAt: Date;
  conge: Conge | null;
  absence: Absence | null;
  demandePermission: DemandePermission | null;
  decisions?: Decision[];
  userId: number;
  user?: User;
  pdfPath?: string | null;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Conge {
  id: number;
  nbJours: number;
  createdAt: Date;
  updatedAt: Date;
  demandeId: number;
  demande?: Demande;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Absence {
  id: number;
  justification: string;
  createdAt: Date;
  updatedAt: Date;
  demandeId: number;
  demande?: Demande;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface DemandePermission {
  id: number;
  duree: string;
  createdAt: Date;
  updatedAt: Date;
  demandeId: number;
  demande?: Demande;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Evenement {
  id: number;
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  images?: string[];       // on stockera comme JSON
  userId: number;
  user?: User;
  validatedBy?: number | null;
  validateur?: User | null;
  archive: boolean;
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Equipement {
  id: number;
  nom: string;
  modele?: string | null;
  images?: string[];       // on stockera comme JSON
  categorie?: string | null;
  dateAcquisition: Date;
  status: string; // ACTIF, HORS_SERVICE
  affectations?: AffectationEquipement[];
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface AffectationEquipement {
  id: number;
  equipementId: number;
  employeId: number;
  pointServiceOrigineId?: number | null;
  pointServiceDestId?: number | null;
  quantite: number;
  status?: "BON" | "ABIME" | "PERDU" | "RETIRE";
  dateAffectation: Date;
  dateFin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  equipement?: Equipement;
  employe?: User;
  pointServiceOrigine?: PointDeService;
  pointServiceDest?: PointDeService;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface ActionCredit {
  id: number;
  type: string;
  commentaire: string;
  date: Date;
  creditId: number;
  credit?: Credit;
  agentId: number;
  agent?: User;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- Credit ----------
export interface Credit {
  id: number;
  beneficiaireId: number;
  beneficiaire?: User;
  montant: number;
  tauxInteret?: number | null;
  dateDebut: Date;
  dateFin: Date;
  status?: string | null;
  actions?: ActionCredit[];
  histories?: CreditHistory[];
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- CreditHistory ----------
export interface CreditHistory {
  id: number;
  creditId: number;
  credit?: Credit;
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
  changedAt: Date;
}


export interface AuthPayload {
  userId: number;
  username: string;
  email: string;
  roles: string[];
}


