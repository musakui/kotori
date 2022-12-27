import type {
	JSONResourceDescriptor,
	NodeInfoDocument,
} from '@musakui/fedi'

export interface WellKnownConfig {
	/**
	 * directory to put well-known files.
	 *
	 * Use this option if your hosting does not work well with `.` (hidden) folders
	 *
	 * @default '.well-known'
	 */
	directory?: string

	/**
	 * Web Host Metadata
	 *
	 * @see https://datatracker.ietf.org/doc/html/rfc6415
	 */
	hostmeta?: null | JSONResourceDescriptor

	/**
	 * NodeInfo
	 *
	 * @see https://github.com/jhass/nodeinfo
	 */
	nodeinfo?: null | NodeInfoDocument

	/**
	 * location for NodeInfo document
	 *
	 * default: `/nodeinfo.json`
	 */
	nodeinfoPath?: string

	/**
	 * WebFinger. `null` disables WebFinger generation
	 *
	 * @see https://webfinger.net
	 */
	webfinger?: null | {
		hostname?: string
		subject?: string | string[] | Record<string, string>
	}
}
