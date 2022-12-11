import { resolveKotoriConfig } from './config.js'
import { profiles } from './profiles.js'
import { suppressRollupWarning } from './misc.js'

/**
 * @param {import('../config').UserConfig} config
 */
export const plugin = (config) => {

	return [
		resolveKotoriConfig(config),
		profiles(),
		suppressRollupWarning(),
	]
}

export default plugin
