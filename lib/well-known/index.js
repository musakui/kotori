import { normalizePath } from 'vite'
import { HostMeta, NodeInfo } from '@musakui/fedi/well-known'
/*
import pkg from '../../package.json' assert { type: 'json' }
*/

/**
 * @param {Partial<import('@musakui/fedi').NodeInfoDocument>} ni
 * @param {number} totalUsers
 */
const resolveNodeInfo = (ni, totalUsers) => NodeInfo.defineDocument({
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
 * @param {import('./config').WellKnownConfig['webfinger']} wf
 * @param {string[]} keys
 * @param {string} dir
 * @return {Record<string, string | null>}
 */
const resolveWebFinger = (wf, keys, dir) => {
	if (wf === null) return {}
	if (typeof wf?.subject === 'string') return { [wf.subject]: `${dir}/webfinger` }
	if (!wf) {
	} else if (Array.isArray(wf.subject)) {
		keys = wf.subject
	} else if (wf.subject) {
		return wf.subject
	}
	return Object.fromEntries(keys.map((k) => [k, null]))
}

/**
 * @param {import('../config').UserConfig} opts
 */
export const resolveWellKnown = (opts) => {
	const wk = opts.wellKnown || {}
	const directory = normalizePath(`/${wk.directory || '.well-known'}/`).slice(1, -1)

	const profileKeys = Object.keys(opts.profiles)

	const hostmeta = wk.hostmeta === null
		? null
		: (wk.hostmeta || HostMeta.define(opts.domain))

	const nodeinfoPath = normalizePath(`/${wk.nodeinfoPath || 'nodeinfo.json'}`).slice(1)

	const nodeinfo = wk.nodeinfo === null
		? null
		: resolveNodeInfo(wk.nodeinfo || {}, profileKeys.length)

	const webfinger = resolveWebFinger(wk.webfinger, profileKeys, directory)

	return {
		directory,
		hostmeta,
		nodeinfo,
		nodeinfoPath,
		webfinger,
	}
}
