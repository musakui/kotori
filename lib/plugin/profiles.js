import { getKotoriConfig } from './config.js'
import { emitter } from './misc.js'

const VIRTUAL_PREFIX = 'virtual:@'
const RESOLVED_PREFIX = '\0' + VIRTUAL_PREFIX

export const profiles = () => {
	let config

	/** @type {Map<string, Array<import('@musakui/fedi/activitypub').ActivityPubActivity>>} */
	const outboxes = new Map()

	return /** @type {import('vite').Plugin} */ ({
		name: 'kotori:profiles',
		apply: (config) => !config?.build?.ssr,
		configResolved(_conf) {
			config = _conf
			for (const pid of _conf.kotoriConfig.profiles.keys()) outboxes.set(pid, [])
		},
		resolveId(id) {
			if (id.startsWith(VIRTUAL_PREFIX)) {
				const [pid] = id.slice(VIRTUAL_PREFIX.length).split('/')
				if (getKotoriConfig(config).profiles.has(pid)) return '\0' + id
			}
		},
		async load(id) {
			if (id.startsWith(RESOLVED_PREFIX)) {
				const [pid, ...path] = id.slice(RESOLVED_PREFIX.length).split('/')
				const user = getKotoriConfig(config).profiles.get(pid)
				if (!path.length) return `export default ${JSON.stringify(user.actor)}`
			}
		},
		async generateBundle() {
			const emit = emitter(this)
			const kotoriConfig = getKotoriConfig(config)

			for (const [pid, profile] of kotoriConfig.profiles) {
				emit(profile.actorPath, JSON.stringify(profile.actor))
				if (profile.outbox.indexPath) {
					const outbox = outboxes.get(pid)
					emit(profile.outbox.indexPath, JSON.stringify({
						...profile.outbox.index,
						totalItems: outbox?.length || 0,
					}))
				}
			}
		}
	})
}
