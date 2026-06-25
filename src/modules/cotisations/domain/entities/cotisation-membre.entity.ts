export class CotisationMembreEntity {
  constructor(
    public readonly id: string,
    public readonly groupeId: string,
    public readonly locataireId: string,
    public readonly estTresorier: boolean,
    public readonly estActif: boolean,
    public readonly dateAdhesion: Date,
    public readonly nom: string | null = null,
    public readonly prenom: string | null = null,
  ) {}
}
