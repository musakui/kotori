import { fileCollector } from './utils.js'
import { resolveProfiles } from './profile/index.js'
import { generateWellKnown } from './well-known/index.js'

/**
 * @param {import('./config').KotoriPluginOptions} opts
 * @return {import('vite').PluginOption} Kotori Plugin
 */
export const plugin = (opts = {}) => {
	/** @type {Map<string, import('./profile/config').OutboxInfo>} */
	let outboxInfos

	const files = fileCollector()

	return {
		name: 'kotori-plugin',
		async buildStart(_buildOpts) {
			if (!opts.domain) this.warn('domain is required to work properly')

			const {
				profiles,
				profilePath,
				outboxes,
			} = resolveProfiles(opts)

			outboxInfos = outboxes

			for (const [pid, profile] of profiles) {
				files.add(`${profilePath}/${pid}`, {
					source: JSON.stringify(profile),
					appType: 'activity+json',
				})
			}

			for (const { fileName, ...file } of generateWellKnown(opts, profiles)) {
				files.add(fileName, file)
			}
		},
		async generateBundle(_buildOpts) {
			for (const [_pid, outbox] of outboxInfos) {
				files.add(outbox.fileName, {
					source: JSON.stringify({
						...outbox.ap,
						totalItems: outbox.items.length,
						orderedItems: outbox.items,
					}),
					appType: 'activity+json',
				})
			}

			try {
				const gen = opts.files instanceof Function
					? opts.files(Object.fromEntries(files))
					: Object.entries(opts.files)
				for (const [name, file] of gen) {
					files.add(name, file)
				}
			} catch (err) {
			}

			for (const [fileName, source] of files.files) {
				this.emitFile({ type: 'asset', fileName, source })
			}

			try {
				const generated = opts.processHeaders(Object.fromEntries(files.headers))
				for (const [fileName, source] of Object.entries(generated)) {
					this.emitFile({ type: 'asset', fileName, source })
				}
			} catch (err) {
			}
		},
	}
}

export default plugin
