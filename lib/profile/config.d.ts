import type {
	SecurityKey,
	ActivityPubActor,
	OrderedCollection,
	ActivityPubActivity,
	JSONResourceDescriptor,
} from '@musakui/fedi'

export interface OutboxConfig {
	items?: object[]
	index?: string
	pagePrefix?: string
	raw?: OrderedCollection<NonNullable<ActivityPubActivity['type']>>
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
	actor?: Partial<ActivityPubActor>

	/**
	 * Additional WebFinger data
	 */
	webfinger?: Partial<JSONResourceDescriptor>

	/**
	 * Public Key PEM
	 */
	publicKey?: string | Partial<SecurityKey>
}
