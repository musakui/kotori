import { parseRequest, verifySignature } from '@musakui/fedi/hs'

/** @typedef {(s: string) => boolean} HostFilter */
/** @typedef {import('@musakui/fedi').ActivityPubActivity} Activity */

/** @type {HostFilter | null} */
let ignoreHost = null

/** @type {Set<string>} */
const actorIds = new Set()

const isMe = (actor) => typeof actor === 'string' && actorIds.has(actor)

/** @param {Activity} */
const isFollow = ({ type, object }) => {
	if (!actorIds.size) return

	if (type === 'Follow' && isMe(object)) {
		return {
			follow: /** @type {string} */ (object)
		}
	}

	if (type === 'Undo' && object?.type === 'Follow' && isMe(object.object)) {
		return {
			unfollow: /** @type {string} */ (object.object)
		}
	}
}

/**
 * Set an Actor ID for identifying follow actions.
 * Can be called multiple times to track multiple IDs.
 *
 * @param {string} id actor ID
 */
export const useActorId = (id) => actorIds.add(id)

/**
 * Set a function to ignore inbox POSTs from specified hosts.
 * The function will be provided with `(new URL(signature.keyId)).hostname`.
 *
 * @param {HostFilter} ignore function that returns `true` for ignored hosts
 */
export const useHostFilter = (ignore) => {
	try {
		ignore('t.co')
		ignoreHost = ignore
	} catch (err) {
		ignoreHost = null
	}
}

/**
 * handle ActivityPub inbox POST request
 *
 * @param {string} method request method (POST)
 * @param {string} path request path
 * @param {Record<string, string>} headers request headers
 * @param {string} body request body
 */
export const handleInbox = async (method, path, headers, body) => {
	if (method.toUpperCase() !== 'POST') return null

	try {
		const sig = await parseRequest({ method, path, headers, body })
		if (ignoreHost) {
			const { hostname } = new URL(sig.keyId)
			if (ignoreHost(hostname)) return null
		}

		const sender = await verifySignature(sig)

		/** @type {Activity} */
		const activity = JSON.parse(body)
		return {
			sender: sender.id,
			activity,
			...isFollow(activity),
		}
	} catch (err) {
		if (err.code === 'KEY_RETRIEVAL_FAILED' && JSON.parse(body).type === 'Delete') {
			return null
		}
		throw err
	}
}
