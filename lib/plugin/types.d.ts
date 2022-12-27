import type {
	JSONResourceDescriptor,
	NodeInfoDocument,
} from '@musakui/fedi'

import { ResolvedProfileConfig } from '../profile/config'

export interface ResolvedConfig {
	domain: string

	wellknown: {
		directory: string
		nodeinfoPath: string
		nodeinfo: NodeInfoDocument | null
		hostmeta: JSONResourceDescriptor | null
		webfinger: Record<string, string | null>
	}

	profiles: Map<string, ResolvedProfileConfig>
}
