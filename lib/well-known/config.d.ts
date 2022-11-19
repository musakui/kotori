type NodeInfoProtocols = 'activitypub' | 'diaspora' | 'xmpp'

/**
 * @link https://github.com/jhass/nodeinfo/blob/main/schemas/2.1/schema.json
 */
export interface NodeInfo {
	version: '1.0' | '1.1' | '2.0' | '2.1'
	software: {
		name: string
		version: string
		homepage?: string
		repository?: string
	}
	protocols: NodeInfoProtocols[]
	services: {
		inbound: string[]
		outbound: string[]
	}
	openRegistrations: boolean
	usage: {
		users: {
			total?: number
			activeHalfYear?: number
			activeMonth?: number
		}
		localPosts?: number
		localComments?: number
	}
	metadata: Record<string, any>
}

export interface WellKnownOptions {
	/**
	 * directory to put well-known files.
	 *
	 * Use if your hosting does not work well with `.` (hidden) folders
	 *
	 * @default '.well-known'
	 */
	directory?: string

	/**
	 * Web Host Metadata
	 *
	 * will be used directly if `string` is provided. set to `null` to disable
	 *
	 * @link https://datatracker.ietf.org/doc/html/rfc6415
	 */
	hostMeta?: null | string

	/**
	 * nodeinfo (stored at `nodeinfoFile`)
	 *
	 * will be used directly if an `object` is provided
	 *
	 * @link https://github.com/jhass/nodeinfo
	 */
	nodeinfo?: null | NodeInfo

	/**
	 * WebFinger. `null` disables WebFinger generation
	 *
	 * default: generate `webfinger/[subject]` for each profile
	 *
	 * @link https://webfinger.net
	 */
	webfinger?: null | {
		hostname?: string
		subject?: string | string[]
	}
}
