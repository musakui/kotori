/**
 * get hostname from url
 * @param {string} url
 */
export const getHostname = (url) => {
	try {
		const { hostname } = new URL(url)
		return hostname
	} catch (err) {
		if (err.code !== 'ERR_INVALID_URL') throw err
		return 'localhost'
	}
}

export const fileCollector = () => {
	/** @type Map<string, string> */
	const files = new Map()

	/** @type Map<string, Record<string, string>> */
	const headers = new Map()

	/**
	 * @param {string} name
	 * @param {import('./config').GeneratedFile} opts
	 */
	const add = (name, opts) => {
		files.set(name, opts.source)
		if (opts.appType || opts.headers) {
			headers.set(name, {
				...headers.get(name),
				...(opts.appType ? { 'content-type': `application/${opts.appType}` } : null),
				...opts.headers,
			})
		}
	}

	return {
		add,
		files,
		headers,
		*[Symbol.iterator]() {
			for (const [fileName, source] of files) {
				yield [
					fileName,
					{ source, headers: headers.get(fileName) },
				]
			}
		},
	}
}
