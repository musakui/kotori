const VIRTUAL_PREFIX = 'virtual:@'
const RESOLVED_PREFIX = '\0' + VIRTUAL_PREFIX

export const profiles = () => {
	let config
	return /** @type {import('vite').Plugin} */ ({
		name: 'kotori:profiles',
		apply: (config) => !config?.build?.ssr,
		configResolved(_conf) {
			config = _conf
		},
		resolveId(id) {
			if (id.startsWith(VIRTUAL_PREFIX)) {
				const [pid] = id.slice(VIRTUAL_PREFIX.length).split('/')
				if (config.kotoriConfig.profiles.has(pid)) return '\0' + id
			}
		},
		async load(id) {
			if (id.startsWith(RESOLVED_PREFIX)) {
				const [pid, ...path] = id.slice(RESOLVED_PREFIX.length).split('/')
				const user = config.kotoriConfig.profiles.get(pid)
				if (!path.length) return `export default ${JSON.stringify(user.actor)}`
			}
		},
	})
}
