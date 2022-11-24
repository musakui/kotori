import type { NodeInfo } from '@musakui/fedi'

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
