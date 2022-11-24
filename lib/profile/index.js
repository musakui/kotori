import { createFilter, normalizePath } from 'vite'
import * as ActivityStreams from '@musakui/fedi/activitystreams'

const CONTEXT = {
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

/**
 * @param {import('./config').KotoriProfile['publicKey']} pubKey
 * @param {string} actorId
 */
const getPublicKey = (pubKey, actor) => {
	if (typeof pubKey === 'string') {
		return {
			id: `${actor}#main-key`,
			owner: actor,
			publicKeyPem: pubKey,
		}
	}
	const { id, owner = actor, ...pk } = pubKey
	return {
		id: `${owner}#${id || 'main-key'}`,
		owner,
		...pk,
	}
}

/**
 * @param {import('../config').KotoriPluginOptions} opts
 */
export const resolveProfiles = (opts) => {
	const profilePath = normalizePath(`/${opts.profilePath || 'u'}/`).slice(1, -1)
	const outboxPath = normalizePath(`/${opts.outboxPath || 'o'}/`).slice(1, -1)

	/** @type {Map<string, import('./config').OutboxInfo>} */
	const outboxes = new Map()

	const profileContext = {
		'@context': [
			ActivityStreams.CONTEXT,
			'https://w3id.org/security/v1',
			{
				...CONTEXT,
				...opts.additionalContext,
			},
		],
	}

	const profiles = new Map(Object.entries(opts.profiles || {}).map(([pid, profile]) => {
		const {
			id,
			isBot,
			inbox,
			outbox,
			publicKey,
			username,
			...rest
		} = profile
		const actor = id || `${opts.domain}/${profilePath}/${pid}`

		if (Array.isArray(outbox) || !(outbox?.startsWith('http'))) {
			const fileName = `${outboxPath}/${pid}`
			outboxes.set(pid, {
				fileName,
				filter: createFilter(outbox),
				items: [],
				ap: {
					[CONTEXT]: ActivityStreams.CONTEXT,
					type: 'OrderedCollection',
					id: `${opts.domain}/${fileName}`,
				},
			})
		}

		return [pid, {
			...profileContext,
			id: actor,
			type: isBot ? 'Application' : 'Person',
			preferredUsername: username || pid,
			inbox: inbox.startsWith('http')
				? inbox
				: `${opts.domain}${normalizePath(`/${inbox}`)}`,
			outbox: outboxes.get(pid)?.ap.id || outbox,
			...rest,
			publicKey: getPublicKey(publicKey, actor),
		}]
	}))

	return {
		outboxes,
		profiles,
		profilePath,
	}
}
