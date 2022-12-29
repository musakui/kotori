import type { ProfileConfig } from './profile/config'
import type { WellKnownConfig } from './well-known/config'

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
}
