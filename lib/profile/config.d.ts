import type {
	Actor,
	SecPublicKey,
	ActivityEndpoint,
	WebFinger,
} from '@musakui/fedi'

export interface OutboxConfig {
	items?: object[]
	index?: string
	raw?: Partial<ActivityEndpoint>
	pagePrefix?: string
}

export interface ProfileConfig {
	/**
	 * Actor inbox path
	 */
	inbox: string

	/**
	 * Actor outbox config
	 */
	outbox?: OutboxConfig

	/**
	 * Other actor information
	 */
	actor?: Partial<Actor>

	/**
	 * Additional WebFinger data
	 */
	webfinger?: Partial<WebFinger>

	/**
	 * Public Key PEM
	 */
	publicKey?: string | Partial<SecPublicKey>
}
