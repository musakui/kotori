import type { ProfileConfig } from './profile/config'
import type { WellKnownConfig } from './well-known/config'

export interface GeneratedFile {
	/**
	 * file contents
	 */
	source: string

	/**
	 * shorthand property for `Content-Type: application/*`
	 *
	 * e.g. `json` for `application/json`
	 *
	 * use `headers` for normal `Content-Type`
	 */
	appType?: string

	/**
	 * headers that the file should be served with
	 */
	headers?: Record<string, string>
}

type GeneratedFiles<T = GeneratedFile> = Record<string, T>

export interface UserConfig {
	/**
	 * domain for website. required during build
	 */
	domain: string

	/**
	 * shared public key (PEM string) for all actors
	 */
	sharedPublicKey?: string

	/**
	 * common prefix for profiles
	 *
	 * user profiles will be found at `/[pid]` by default
	 *
	 * @default ''
	 */
	profilesPath?: string

	/**
	 * user profiles. the key will be used as the internal ID
	 */
	profiles?: Record<string, ProfileConfig | string>

	/**
	 * config for `.well-known` files
	 */
	wellKnown?: WellKnownConfig

	/**
	 * process headers for all generated files
	 */
	processHeaders?: (h: Record<string, Record<string, string>>) => Record<string, string>
}
