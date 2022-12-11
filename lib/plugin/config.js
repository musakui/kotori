import { resolveProfiles } from '../profile/index.js'
import { resolveWellKnown } from '../well-known/index.js'

/**
 * @param {import('../config').UserConfig} kotoriConfig
 */
export const resolveKotoriConfig = (kotoriConfig) => /** @type {import('vite').Plugin} */ ({
	name: 'kotori:resolveKotoriConfig',
	enforce: 'pre',
	async configResolved(config) {
		if (config.command === 'serve' && !kotoriConfig.domain) {
			kotoriConfig.domain = `http://${config.server.host || 'localhost'}:${config.server.port || 5173}`
		}
		Object.assign(config, {
			kotoriConfig: {
				profiles: resolveProfiles(kotoriConfig),
				wellKnown: resolveWellKnown(kotoriConfig),
			}
		})
	},
})
