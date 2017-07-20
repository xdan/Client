'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('path'),
	findUp = require('find-up'),
	cache = {};

/**
 * Monic replacer for Stylus @import declarations
 *
 * @param str - source string
 * @param file - file path
 * @returns {Promise<string>}
 */
module.exports = async function (str, file) {
	const
		cwd = path.dirname(file),
		parent = path.dirname(cwd),
		c = cache[parent] = cache[parent] || {};

	if (c[str]) {
		return c[str];
	}

	const
		blocks = await findUp('src', {cwd});

	return c[str] = str.replace(/@import "([^./~].*?\.styl)"/g, (str, url) => {
		url = path.relative(path.dirname(file), path.join(blocks, url)).replace(/\\/g, '/');
		return `@import "${url}"`;
	});
};
