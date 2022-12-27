import { normalizePath } from 'vite'
import { WebFinger } from '@musakui/fedi/well-known'
import { CONTEXT } from '@musakui/fedi/activitystreams'
import * as ActivityPub from '@musakui/fedi/activitypub'
import { getHostname } from '../utils.js'

const DEFAULT_KEY_ID = 'main-key'

/**
 * @param {string | Partial<ActivityPub.SecurityKey>} pubKey
 * @param {string} actor owner of pubKey
 * @param {string} sharedKey shared Public Key (PEM)
 * @return {ActivityPub.SecurityKey} Public Key info
 */
const getPublicKey = (pubKey, actor, sharedKey = '') => {
	if (typeof pubKey === 'string' || !pubKey) {
		return {
			id: `${actor}#${DEFAULT_KEY_ID}`,
			owner: actor,
			publicKeyPem: pubKey || sharedKey,
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

	/** @param {string} path */
	const toURL = (path) => `${new URL(path, opts.domain)}`

	/** @param {import('./config').ProfileConfig['outbox']} conf */
	const getOutbox = (conf, path) => {
		if (typeof conf === 'string') {
			return {
				index: { id: toURL(conf) },
			}
		}

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
				'@context': CONTEXT,
				id: toURL(indexPath),
				type: 'OrderedCollection',
				...raw,
			},
			pagePrefix: `${path}/${pagePrefix}`,
			...rest,
		}
	}

	const context = [
		CONTEXT,
		ActivityPub.CONTEXT.SECURITY,
		toURL('/context.jsonld'),
	]

	return new Map(Object.entries(opts.profiles || {}).map(([pid, profile]) => {
		if (typeof profile === 'string') return [pid, null]

		const path = normalizePath(`/${opts.profilesPath || ''}/${pid}/`).slice(1, -1)

		const { publicKey: pk, ...rest } = profile.actor || {}

		const actorPath = `${path}/id`
		const outbox = getOutbox(profile.outbox, path)

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
		const webfinger = WebFinger.define(actor.preferredUsername, wfHost, actor.id, profile.webfinger)

		return [pid, {
			path,
			webfinger,
			actorPath,
			actor: { ...actor, publicKey },
			outbox,
		}]
	}))
}
