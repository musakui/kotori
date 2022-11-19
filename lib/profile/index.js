import { createFilter, normalizePath } from 'vite'

const CONTEXT = '@context'
const ACTIVITYSTREAMS = 'https://www.w3.org/ns/activitystreams'

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
					[CONTEXT]: ACTIVITYSTREAMS,
					type: 'OrderedCollection',
					id: `${opts.domain}/${fileName}`,
				},
			})
		}

		return [pid, {
			[CONTEXT]: [ACTIVITYSTREAMS, 'https://w3id.org/security/v1'],
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
