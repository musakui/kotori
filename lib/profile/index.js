import { normalizePath } from 'vite'
import { WF } from '@musakui/fedi/well-known'
import * as ActivityPub from '@musakui/fedi/activitypub'
import * as ActivityStreams from '@musakui/fedi/activitystreams'
import { getHostname } from '../utils.js'

const DEFAULT_CONTEXT = {
	schema: 'http://schema.org',
	toot: 'http://joinmastodon.org/ns#',
	misskey: 'https://misskey-hub.net/ns#',
	vcard: 'http://www.w3.org/2006/vcard/ns#',
	Hashtag: 'as:Hashtag',
	quoteUrl: 'as:quoteUrl',
	sensitive: 'as:sensitive',
	manuallyApprovesFollowers: 'as:manuallyApprovesFollowers',
	Emoji: 'toot:Emoji',
	featured: 'toot:featured',
	discoverable: 'toot:discoverable',
	value: 'schema:value',
	PropertyValue: 'schema:PropertyValue',
	isCat: 'misskey:isCat',
	_misskey_reaction: 'misskey:_misskey_reaction',
}

const DEFAULT_KEY_ID = 'main-key'

/**
 * @param {string | Partial<ActivityPub.SecPublicKey>} pubKey
 * @param {string} actor owner of pubKey
 * @param {string} sharedKey shared Public Key (PEM)
 * @return {ActivityPub.SecPublicKey} Public Key info
 */
const getPublicKey = (pubKey, actor, sharedKey = '') => {
	if (typeof pubKey === 'string') {
		return {
			id: `${actor}#${DEFAULT_KEY_ID}`,
			owner: actor,
			publicKeyPem: pubKey,
		}
	}
	const { id, owner = actor, ...pk } = pubKey
	return {
		id: `${owner}#${id || DEFAULT_KEY_ID}`,
		owner,
		publicKeyPem: sharedKey,
		...pk,
	}
}

/**
 * @param {import('../config').UserConfig} opts
 */
export const resolveProfiles = (opts) => {
	const wfHost = opts.wellKnown?.webfinger?.hostname || getHostname(opts.domain)

	const context = [
		ActivityStreams.CONTEXT,
		'https://w3id.org/security/v1',
		{
			...DEFAULT_CONTEXT,
			...opts.profileContext,
		},
	]

	/** @param {string} path */
	const toURL = (path) => `${new URL(path, opts.domain)}`

	/** @param {import('./config').ProfileConfig['outbox']} conf */
	const getOutbox = (conf) => {
		const {
			raw,
			items = [],
			index = `outbox`,
			pagePrefix = `p`,
			...rest
		} = conf || {}

		const indexPath = `${path}/${index}`

		return {
			items,
			indexPath,
			index: {
				'@context': ActivityStreams.CONTEXT,
				id: toURL(indexPath),
				type: 'OrderedCollection',
				...raw,
			},
			pagePrefix: `${path}/${pagePrefix}`,
			...rest,
		}
	}

	return new Map(Object.entries(opts.profiles || {}).map(([pid, profile]) => {
		if (typeof profile === 'string') return [pid, null]

		const path = normalizePath(`/${opts.profilesPath || ''}/${pid}/`).slice(1, -1)

		const { publicKey: pk, ...rest } = profile.actor || {}

		const actorPath = `${path}/id`
		const outbox = getOutbox(profile.outbox)

		const actor = {
			'@context': context,
			id: toURL(actorPath),
			type: 'Person',
			preferredUsername: pid,
			inbox: toURL(profile.inbox),
			outbox: outbox.index.id,
			...rest,
		}

		const publicKey = getPublicKey(profile.publicKey, actor.id, opts.sharedPublicKey)

		const webfinger = WF.define({
			subject: WF.subject(actor.preferredUsername, wfHost),
			...profile.webfinger,
			links: [
				{
					rel: 'self',
					href: actor.id,
					type: ActivityPub.CONTENT_TYPE,
				},
				...(profile.webfinger?.links || []),
			],
		})

		return [pid, {
			path,
			webfinger,
			actorPath,
			actor: { ...actor, publicKey },
			outbox,
		}]
	}))
}
