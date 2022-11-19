export interface KotoriProfile {
	id?: string
	isBot?: boolean
	username?: string
	inbox: string
	outbox?: string | string[]
	publicKey: string | {
		id?: string
		owner?: string
		publicKeyPem: string
	}
}

export interface OutboxInfo {
	fileName: string
	items: object[]
	filter: (id: unknown) => boolean
	ap: { id: string }
}
