import { JRD, NodeInfo } from '@musakui/fedi/well-known'
import { getKotoriConfig } from './config.js'
import { buildNotSSR, emitter } from './misc.js'

export const generateWellKnown = () => {
	let config
	return /** @type {import('vite').Plugin} */ ({
		name: 'kotori:generateWellKnown',
		enforce: 'post',
		apply: buildNotSSR,
		configResolved(_conf) {
			config = _conf
		},
		async generateBundle() {
			const emit = emitter(this)
			const kotoriConfig = getKotoriConfig(config)

			const {
				directory: wfDir,
				hostmeta,
				nodeinfo,
				nodeinfoPath,
				webfinger,
			} = kotoriConfig.wellknown

			if (hostmeta) {
				emit(`${wfDir}/host-meta`, JRD.toXRD(hostmeta))
				emit(`${wfDir}/host-meta.json`, JSON.stringify(hostmeta))
			}

			if (nodeinfo) {
				const href = new URL(nodeinfoPath, kotoriConfig.domain)
				emit(`${wfDir}/nodeinfo`, JSON.stringify(NodeInfo.define(href, nodeinfo.version)))
				emit(nodeinfoPath, JSON.stringify(nodeinfo))
			}

			for (const [pid, path] of Object.entries(webfinger)) {
				const profile = kotoriConfig.profiles.get(pid)
				if (!profile) continue
				emit(path || `${wfDir}/webfinger/${profile.webfinger.subject}`, JSON.stringify(profile.webfinger))
			}
		},
	})
}
