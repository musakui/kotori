import { normalizePath } from 'vite'
import { getHostname } from '../utils.js'
import {
	WebFinger,
	defineNodeInfo,
	generateHostMeta,
} from '@musakui/fedi/well-known'
import pkg from '../../package.json' assert { type: 'json' }

/**
 * @param {Partial<import('@musakui/fedi').NodeInfo>} ni
 * @param {number} totalUsers
 * @return {import('@musakui/fedi').NodeInfo}
 */
const generateNodeinfo = (ni, totalUsers) => defineNodeInfo({
	...ni,
	software: {
		name: 'kotori',
		version: pkg.version,
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
 * @param {import('../config').KotoriPluginOptions} opts
 * @param {ReturnType<import('../profile').resolveProfiles>['profiles']} profiles
 */
export function* generateWellKnown(opts, profiles) {
	const wk = opts.wellKnown || {}
	const wkDir = normalizePath(`/${wk.directory || '.well-known'}/`).slice(1, -1)

	if (wk.hostMeta !== null) {
		yield {
			fileName: `${wkDir}/host-meta`,
			source: typeof wk.hostMeta === 'string'
				? wk.hostMeta
				: generateHostMeta(opts.domain),
			appType: 'xrd+xml',
		}
	}

	if (wk.nodeinfo !== null) {
		const ni = generateNodeinfo(wk.nodeinfo || {}, profiles.size)
		const fileName = `nodeinfo/${ni.version}`
		const links = [
			{
				rel: `http://nodeinfo.diaspora.software/ns/schema/${ni.version}`,
				href: `${opts.domain}/${fileName}`,
			},
		]

		yield {
			fileName: `${wkDir}/nodeinfo`,
			source: JSON.stringify({
				links,
			}),
			appType: 'jrd+json',
		}

		yield {
			fileName,
			source: JSON.stringify(ni),
			appType: 'json',
		}
	}

	if (wk.webfinger !== null) {
		const host = wk.webfinger?.hostname || getHostname(opts.domain)
		const subs = wk.webfinger?.subject
		const single = typeof subs === 'string'
		const subjects = Array.isArray(subs)
			? new Set(subs)
			: (single ? [subs] : profiles.keys())

		for (const sub of subjects) {
			const profile = profiles.get(sub)
			if (!profile) continue

			const subject = WebFinger.subject(sub, host)
			const wf = WebFinger.define({
				subject,
				links: [
					{
						rel: 'self',
						href: profile.id,
						type: 'application/activity+json'
					},
				],
			})

			yield {
				fileName: `${wkDir}/webfinger${single ? '' : `/${subject}`}`,
				source: JSON.stringify(wf),
				appType: 'jrd+json',
			}
		}
	}
}
