import { normalizePath } from 'vite'
import { getHostname } from '../utils.js'
import pkg from '../../package.json' assert { type: 'json' }

/**
 * @param {string} domain
 */
export const generateHostMeta = (domain) => `<?xml version="1.0" encoding="UTF-8"?>
<XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
	<Link rel="lrdd" type="application/xrd+xml" template="${domain}/.well-known/webfinger?resource={uri}"/>
</XRD>`

/**
 * @param {Partial<import('./config').NodeInfo>} ni
 * @param {number} totalUsers
 * @return {import('./config').NodeInfo}
 */
export const generateNodeinfo = (ni, totalUsers) => ({
	version: ni.version || '2.1',
	software: {
		name: 'kotori',
		version: pkg.version,
		...ni.software,
	},
	services: {
		inbound: ni.services?.inbound || [],
		outbound: ni.services?.outbound || [],
	},
	protocols: ni.protocols || ['activitypub'],
	openRegistrations: Boolean(ni.openRegistrations),
	usage: {
		users: {
			total: totalUsers,
			...ni.usage?.users,
		},
		...ni.usage,
	},
	metadata: { ...ni.metadata },
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

			const subject = `acct:${sub}@${host}`
			const links = [
				{
					rel: 'self',
					href: profile.id,
					type: 'application/activity+json'
				},
			]

			yield {
				fileName: `${wkDir}/webfinger${single ? '' : `/${subject}`}`,
				source: JSON.stringify({
					subject,
					links,
				}),
				appType: 'jrd+json',
			}
		}
	}
}
