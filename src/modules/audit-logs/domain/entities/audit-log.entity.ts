export class AuditLogEntity {
  constructor(
    public readonly id: string,
    public readonly action: string,
    public readonly table: string,
    public readonly enregistrementId: string,
    public readonly details: Record<string, unknown>,
    public readonly ipAdresse: string | null,
    public readonly userAgent: string | null,
    public readonly userId: string | null,
    public readonly createdAt: Date,
  ) {}
}
