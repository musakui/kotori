import { resolveKotoriConfig } from './config.js'
import { profiles } from './profiles.js'
import { generateWellKnown } from './wellKnown.js'
import { suppressRollupWarning } from './misc.js'

/**
 * @param {import('../config').UserConfig} config
 */
export const plugin = (config) => {

	return [
		resolveKotoriConfig(config),
		profiles(),
		generateWellKnown(),
		suppressRollupWarning(),
	]
}

export default plugin
