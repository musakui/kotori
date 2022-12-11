/**
 * @typedef {import('vite').Plugin} Plugin
 */

export const suppressRollupWarning = () => /** @type {Plugin} */ ({
	name: 'kotori:suppressRollupWarning',
	apply: 'build',
	enforce: 'post',
	async configResolved(config) {
		const ori = config.build.rollupOptions.onwarn
		config.build.rollupOptions.onwarn = function (warning, warn) {
			if (warning.code === 'EMPTY_BUNDLE') return

			if (ori) {
				ori.apply(this, arguments)
			} else {
				warn(warning)
			}
		}
	}
})

/**
 * @param {import('vite').UserConfig} config
 * @param {import('vite').ConfigEnv} env
 */
export const buildNotSSR = (config, env) => env.command === 'build' && !config.build.ssr
