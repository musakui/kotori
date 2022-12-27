import type {
	SecurityKey,
	ActivityPubActor,
	OrderedCollection,
	ActivityPubActivity,
	JSONResourceDescriptor,
} from '@musakui/fedi'

type OutboxCollection = OrderedCollection<NonNullable<ActivityPubActivity['type']>>

export interface OutboxConfig {
	items?: object[]
	index?: string
	pagePrefix?: string
	raw?: Partial<OutboxCollection>
}

export interface ProfileConfig {
	/**
	 * Actor inbox path
	 */
	inbox: string

	/**
	 * Actor outbox config
	 */
	outbox: string | OutboxConfig

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

export interface ResolvedOutboxConfig {
	items: object[]
	indexPath: string
	pagePrefix: string
	index: OutboxCollection
}

export interface ResolvedProfileConfig {
	path: string
	actorPath: string
	actor: ActivityPubActor
	outbox: ResolvedOutboxConfig
	webfinger: JSONResourceDescriptor
}
