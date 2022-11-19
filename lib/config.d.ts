import type { KotoriProfile } from './profile/config'
import type { WellKnownOptions } from './well-known/config'

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

export interface KotoriPluginOptions {
	/**
	 * domain for website. required during build
	 */
	domain: string

	/**
	 * profiles to generate. the key will be used as the profile id
	 */
	profiles?: Record<string, KotoriProfile>

	/**
	 * common prefix for profiles
	 *
	 * user profile will be found at `/u/[username]` by default
	 *
	 * @default 'u'
	 */
	profilePath?: string

	/**
	 * common prefix for outbox (posts)
	 *
	 * user outbox will be found at `/o/[username]` by default
	 *
	 * @default 'o'
	 */
	outboxPath?: string

	/**
	 * options for `.well-known` files
	 */
	wellKnown?: WellKnownOptions

	/**
	 * other files to be generated. key will be used as path to file
	 */
	files?: GeneratedFiles | ((f: GeneratedFiles<Omit<GeneratedFile, 'appType'>>) => GeneratedFiles)

	/**
	 * process headers for all generated files
	 */
	processHeaders?: (h: Record<string, Record<string, string>>) => Record<string, string>
}
