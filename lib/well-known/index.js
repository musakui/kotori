import { normalizePath } from 'vite'
import {
	defineNodeInfo,
	generateHostMeta,
} from '@musakui/fedi/well-known'
/*
import pkg from '../../package.json' assert { type: 'json' }
*/

/** @typedef {import('@musakui/fedi').NodeInfo} NodeInfo */

/**
 * @param {Partial<NodeInfo>} ni
 * @param {number} totalUsers
 * @return {NodeInfo}
 */
const generateNodeinfo = (ni, totalUsers) => defineNodeInfo({
	...ni,
	software: {
		name: 'kotori',
		version: '0.1.0', // pkg.version,
		...ni.software,
	},
	usage: {
		...ni.usage,
		users: {
			total: totalUsers,
			...ni.usage?.users,
		},
	},
})

/**
 * @param {import('../config').UserConfig} opts
 */
export const resolveWellKnown = (opts) => {
	const wk = opts.wellKnown || {}
	const directory = normalizePath(`/${wk.directory || '.well-known'}/`).slice(1, -1)

	const hostMeta = wk.hostMeta === null
		? null
		: (typeof wk.hostMeta === 'string' ? wk.hostMeta : generateHostMeta(opts.domain))

	const nodeinfo = wk.nodeinfo === null
		? null
		: generateNodeinfo(wk.nodeinfo || {}, Object.keys(opts.profiles).length)

	return {
		directory,
		hostMeta,
		nodeinfo,
	}
}
