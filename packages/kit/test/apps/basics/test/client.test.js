import { expect } from '@playwright/test';
import { test } from '../../../utils.js';

/** @typedef {import('@playwright/test').Response} Response */

test.skip(({ javaScriptEnabled }) => !javaScriptEnabled);

test.describe.configure({ mode: 'parallel' });

test.describe('a11y', () => {
	test('applies autofocus after an enhanced form submit', async ({ page }) => {
		await page.goto('/accessibility/autofocus/b');

		await page.click('#submit');
		await page.waitForFunction(() => document.activeElement?.nodeName === 'INPUT', null, {
			timeout: 1000
		});
	});
});

test.describe('Caching', () => {
	test('caches __data.json requests with invalidated search param', async ({ page, app }) => {
		await page.goto('/');
		const [, response] = await Promise.all([
			app.goto('/caching/server-data'),
			page.waitForResponse((request) =>
				request.url().endsWith('server-data/__data.json?x-sveltekit-invalidated=_1')
			)
		]);
		expect(response.headers()['cache-control']).toBe('public, max-age=30');
	});
});

test.describe('Endpoints', () => {
	test('calls a delete handler', async ({ page }) => {
		await page.goto('/delete-route');
		await page.locator('.del').click();
		expect(await page.innerHTML('h1')).toBe('deleted 42');
	});
});

test.describe('Load', () => {
	test('load function is only called when necessary', async ({ app, page }) => {
		await page.goto('/load/change-detection/one/a');
		expect(await page.textContent('h1')).toBe('layout loads: 1');
		expect(await page.textContent('h2')).toBe('x: a: 1');

		await app.goto('/load/change-detection/one/a?unused=whatever');
		expect(await page.textContent('h2')).toBe('x: a: 1');

		await app.goto('/load/change-detection/two/b');
		expect(await page.textContent('h2')).toBe('y: b: 1');

		await app.goto('/load/change-detection/one/a');
		expect(await page.textContent('h2')).toBe('x: a: 2');

		await app.goto('/load/change-detection/one/b');
		expect(await page.textContent('h2')).toBe('x: b: 3');

		await app.invalidate('/load/change-detection/data.json');
		expect(await page.textContent('h1')).toBe('layout loads: 2');
		expect(await page.textContent('h2')).toBe('x: b: 3');

		await app.invalidate('/load/change-detection/data.json');
		expect(await page.textContent('h1')).toBe('layout loads: 3');
		expect(await page.textContent('h2')).toBe('x: b: 3');

		await app.invalidate('custom:change-detection-layout');
		expect(await page.textContent('h1')).toBe('layout loads: 4');
		expect(await page.textContent('h2')).toBe('x: b: 3');

		await page.click('button:has-text("invalidate change-detection/data.json")');
		await page.waitForFunction('window.invalidated');
		expect(await page.textContent('h1')).toBe('layout loads: 5');
		expect(await page.textContent('h2')).toBe('x: b: 3');

		await page.click('button:has-text("invalidate all")');
		await page.waitForFunction('window.invalidated');
		expect(await page.textContent('h1')).toBe('layout loads: 6');
		expect(await page.textContent('h2')).toBe('x: b: 4');
	});

	test('accessing url.hash from load errors and suggests using page store', async ({ page }) => {
		await page.goto('/load/url-hash#please-dont-send-me-to-load');
		expect(await page.textContent('#message')).toBe(
			'This is your custom error page saying: "Cannot access event.url.hash. Consider using `$page.url.hash` inside a component instead"'
		);
	});

	test('url instance methods work in load', async ({ page }) => {
		await page.goto('/load/url-to-string');
		expect(await page.textContent('h1')).toBe("I didn't break!");
	});

	test('server data from previous is not reused if next page has no load function', async ({
		page,
		app
	}) => {
		await page.goto('/load/server-data-reuse/with-server-load');
		expect(await page.textContent('pre')).toBe(
			JSON.stringify({ foo: { bar: 'Custom layout' }, server: true })
		);
		await app.goto('/load/server-data-reuse/no-load');
		expect(await page.textContent('pre')).toBe(JSON.stringify({ foo: { bar: 'Custom layout' } }));

		await page.goto('/load/server-data-reuse/with-changing-parent/with-server-load');
		expect(await page.textContent('pre')).toBe(
			JSON.stringify({
				foo: { bar: 'Custom layout' },
				title: '/load/server-data-reuse/with-changing-parent/with-server-load',
				server: true
			})
		);
		await app.goto('/load/server-data-reuse/with-changing-parent/no-load');
		expect(await page.textContent('pre')).toBe(
			JSON.stringify({
				foo: { bar: 'Custom layout' },
				title: '/load/server-data-reuse/with-changing-parent/no-load'
			})
		);
	});

	test('keeps server data when valid while not reusing client load data', async ({
		page,
		clicknav
	}) => {
		await page.goto('/load/url-query-param');

		expect(await page.textContent('h1')).toBe('Hello ');
		expect(await page.textContent('p')).toBe('This text comes from the server load function');

		await clicknav('a[href="/load/url-query-param?currentClientState=ABC"]');
		expect(await page.textContent('h1')).toBe('Hello ABC');
		expect(await page.textContent('p')).toBe('This text comes from the server load function');

		await clicknav('a[href="/load/url-query-param?currentClientState=DEF"]');
		expect(await page.textContent('h1')).toBe('Hello DEF');
		expect(await page.textContent('p')).toBe('This text comes from the server load function');

		await clicknav('a[href="/load/url-query-param"]');
		expect(await page.textContent('h1')).toBe('Hello ');
		expect(await page.textContent('p')).toBe('This text comes from the server load function');
	});

	test('load does not call fetch if max-age allows it', async ({ page }) => {
		page.addInitScript(`
			window.now = 0;
			window.performance.now = () => now;
		`);

		await page.goto('/load/cache-control/default');
		await expect(page.getByText('Count is 0')).toBeVisible();
		await page.locator('button').click();
		await page.waitForLoadState('networkidle');
		await expect(page.getByText('Count is 0')).toBeVisible();

		await page.evaluate(() => (window.now = 2500));

		await page.locator('button').click();
		await expect(page.getByText('Count is 2')).toBeVisible();
	});

	test('load does ignore ttl if fetch cache options says so', async ({ page }) => {
		await page.goto('/load/cache-control/force');
		await expect(page.getByText('Count is 0')).toBeVisible();
		await page.locator('button').click();
		await expect(page.getByText('Count is 1')).toBeVisible();
	});

	test('load busts cache if non-GET request to resource is made', async ({ page }) => {
		await page.goto('/load/cache-control/bust');
		await expect(page.getByText('Count is 0')).toBeVisible();
		await page.locator('button').click();
		await expect(page.getByText('Count is 1')).toBeVisible();
	});

	test('__data.json has cache-control: private, no-store', async ({ page, clicknav }) => {
		await page.goto('/load/server-data-nostore?x=1');

		const [response] = await Promise.all([
			page.waitForResponse((response) => /__data\.js/.test(response.url())),
			clicknav('[href="/load/server-data-nostore?x=2"]')
		]);

		expect(response.headers()['cache-control']).toBe('private, no-store');
	});

	test('cache with body hash', async ({ page, clicknav }) => {
		// 1. go to the page (first load, we expect the right data)
		await page.goto('/load/fetch-cache-control/load-data');
		expect(await page.textContent('div#fr')).toBe(JSON.stringify({ hi: 'bonjour' }));
		expect(await page.textContent('div#hu')).toBe(JSON.stringify({ hi: 'szia' }));

		// 2. change to another route (client side)
		await clicknav('[href="/load/fetch-cache-control"]');

		// 3. come back to the original page (client side)
		let did_request_data = false;
		page.on('request', (request) => {
			if (request.url().endsWith('fetch-cache-control/load-data')) {
				did_request_data = true;
			}
		});
		await clicknav('[href="/load/fetch-cache-control/load-data"]');

		// 4. data should still be the same (and cached)
		expect(await page.textContent('div#fr')).toBe(JSON.stringify({ hi: 'bonjour' }));
		expect(await page.textContent('div#hu')).toBe(JSON.stringify({ hi: 'szia' }));
		expect(did_request_data).toBe(false);
	});

	test('do not use cache if headers are different', async ({ page, clicknav }) => {
		await page.goto('/load/fetch-cache-control/headers-diff');

		// 1. We expect the right data
		expect(await page.textContent('h2')).toBe('a / b');

		// 2. Change to another route (client side)
		await clicknav('[href="/load/fetch-cache-control"]');

		// 3. Come back to the original page (client side)
		const requests = [];
		page.on('request', (request) => requests.push(request));
		await clicknav('[href="/load/fetch-cache-control/headers-diff"]');

		// 4. We expect the same data and no new request because it was cached.
		expect(await page.textContent('h2')).toBe('a / b');
		expect(requests).toEqual([]);
	});

	if (process.env.DEV) {
		test('using window.fetch causes a warning', async ({ page, baseURL }) => {
			await Promise.all([
				page.goto('/load/window-fetch/incorrect'),
				page.waitForEvent('console', {
					predicate: (message) => {
						return (
							message.text() ===
							`Loading ${baseURL}/load/window-fetch/data.json using \`window.fetch\`. For best results, use the \`fetch\` that is passed to your \`load\` function: https://kit.svelte.dev/docs/load#making-fetch-requests`
						);
					},
					timeout: 3_000
				})
			]);
			expect(await page.textContent('h1')).toBe('42');

			/** @type {string[]} */
			const warnings = [];
			page.on('console', (msg) => {
				if (msg.type() === 'warning') {
					warnings.push(msg.text());
				}
			});

			await page.goto('/load/window-fetch/correct');
			expect(await page.textContent('h1')).toBe('42');

			expect(warnings).not.toContain(
				`Loading ${baseURL}/load/window-fetch/data.json using \`window.fetch\`. For best results, use the \`fetch\` that is passed to your \`load\` function: https://kit.svelte.dev/docs/load#making-fetch-requests`
			);
		});
	}

	if (!process.env.DEV) {
		test('does not fetch __data.json if no server load function exists', async ({
			page,
			clicknav
		}) => {
			await page.goto('/load/no-server-load/a');

			const pathnames = [];
			page.on('request', (r) => pathnames.push(new URL(r.url()).pathname));
			await clicknav('[href="/load/no-server-load/b"]');

			expect(pathnames).not.toContain(`/load/no-server-load/b/__data.json`);
		});
	}
});

test.describe('Page options', () => {
	test('applies generated component styles with ssr=false (hides announcer)', async ({
		page,
		clicknav
	}) => {
		await page.goto('/no-ssr');
		await clicknav('[href="/no-ssr/other"]');

		expect(
			await page.evaluate(() => {
				const el = document.querySelector('#svelte-announcer');
				return el && getComputedStyle(el).position;
			})
		).toBe('absolute');
	});
});

test.describe('SPA mode / no SSR', () => {
	test('Can use browser-only global on client-only page through ssr config in handle', async ({
		page,
		read_errors
	}) => {
		await page.goto('/no-ssr/browser-only-global');
		await expect(page.locator('p')).toHaveText('Works');
		expect(read_errors('/no-ssr/browser-only-global')).toBe(undefined);
	});

	test('Can use browser-only global on client-only page through ssr config in +layout.js', async ({
		page,
		read_errors
	}) => {
		await page.goto('/no-ssr/ssr-page-config');
		await expect(page.locator('p')).toHaveText('Works');
		expect(read_errors('/no-ssr/ssr-page-config')).toBe(undefined);
	});

	test('Can use browser-only global on client-only page through ssr config in +page.js', async ({
		page,
		read_errors
	}) => {
		await page.goto('/no-ssr/ssr-page-config/layout/inherit');
		await expect(page.locator('p')).toHaveText('Works');
		expect(read_errors('/no-ssr/ssr-page-config/layout/inherit')).toBe(undefined);
	});

	test('Cannot use browser-only global on page because of ssr config in +page.js', async ({
		page
	}) => {
		await page.goto('/no-ssr/ssr-page-config/layout/overwrite');
		await expect(page.locator('p')).toHaveText(
			'This is your custom error page saying: "document is not defined"'
		);
	});
});

test.describe('$app/stores', () => {
	test('can use $app/stores from anywhere on client', async ({ page }) => {
		await page.goto('/store/client-access');
		await expect(page.locator('h1')).toHaveText('undefined');
		await page.locator('button').click();
		await expect(page.locator('h1')).toHaveText('/store/client-access');
	});

	test('$page.data does not update if data is unchanged', async ({ page, app }) => {
		await page.goto('/store/data/store-update/a');
		await app.goto('/store/data/store-update/b');
		await expect(page.locator('p')).toHaveText('$page.data was updated 0 time(s)');
	});

	test('$page.data does update if keys did not change but data did', async ({ page, app }) => {
		await page.goto('/store/data/store-update/same-keys/same');
		await app.goto('/store/data/store-update/same-keys');
		await expect(page.locator('p')).toHaveText('$page.data was updated 1 time(s)');
	});

	test('$page.data does update if keys did not change but data did (2)', async ({ page, app }) => {
		await page.goto('/store/data/store-update/same-keys/same-deep/nested');
		await app.goto('/store/data/store-update/same-keys');
		await expect(page.locator('p')).toHaveText('$page.data was updated 1 time(s)');
	});
});

test.describe('Invalidation', () => {
	test('+layout.server.js does not re-run when downstream load functions are invalidated', async ({
		page,
		clicknav
	}) => {
		await page.goto('/load/unchanged/isolated/a');
		expect(await page.textContent('h1')).toBe('slug: a');
		expect(await page.textContent('h2')).toBe('count: 0');

		await clicknav('[href="/load/unchanged/isolated/b"]');
		expect(await page.textContent('h1')).toBe('slug: b');
		expect(await page.textContent('h2')).toBe('count: 0');
	});

	test('+layout.server.js re-runs when await parent() is called from downstream load function', async ({
		page,
		clicknav
	}) => {
		await page.goto('/load/unchanged-parent/uses-parent/a');
		expect(await page.textContent('h1')).toBe('slug: a');
		expect(await page.textContent('h2')).toBe('count: 0');
		expect(await page.textContent('h3')).toBe('doubled: 0');

		await clicknav('[href="/load/unchanged-parent/uses-parent/b"]');
		expect(await page.textContent('h1')).toBe('slug: b');
		expect(await page.textContent('h2')).toBe('count: 0');

		// this looks wrong, but is actually the intended behaviour (the increment side-effect in a GET would be a bug in a real app)
		expect(await page.textContent('h3')).toBe('doubled: 2');
	});

	test('load function re-runs when searchParams change', async ({ page, clicknav }) => {
		await page.goto('/load/invalidation/url?a=1');
		expect(await page.textContent('h1')).toBe('1');

		await clicknav('[href="?a=2"]');
		expect(await page.textContent('h1')).toBe('2');

		await clicknav('[href="?a=3"]');
		expect(await page.textContent('h1')).toBe('3');
	});

	test('server-only load functions are re-run following forced invalidation', async ({ page }) => {
		await page.goto('/load/invalidation/forced');
		expect(await page.textContent('h1')).toBe('a: 0, b: 1');

		await page.click('button.invalidateall');
		await page.evaluate(() => window.promise);
		expect(await page.textContent('h1')).toBe('a: 2, b: 3');

		await page.click('button.invalidateall');
		await page.evaluate(() => window.promise);
		expect(await page.textContent('h1')).toBe('a: 4, b: 5');
	});

	test('server-only load functions are re-run following goto with forced invalidation', async ({
		page
	}) => {
		await page.goto('/load/invalidation/forced-goto');
		expect(await page.textContent('h1')).toBe('a: 0, b: 1');

		await page.click('button.goto');
		await page.evaluate(() => window.promise);
		expect(await page.textContent('h1')).toBe('a: 2, b: 3');
	});

	test('multiple invalidations run concurrently', async ({ page }) => {
		await page.goto('/load/invalidation/multiple');
		await expect(page.getByText('layout: 0, page: 0')).toBeVisible();

		await page.click('button.layout');
		await page.click('button.layout');
		await page.click('button.page');
		await page.click('button.page');
		await page.click('button.layout');
		await page.click('button.page');
		await page.click('button.all');
		await expect(page.getByText('layout: 4, page: 4')).toBeVisible();
	});

	test('invalidateAll persists through redirects', async ({ page }) => {
		await page.goto('/load/invalidation/multiple/redirect');
		await page.locator('button.redirect').click();
		await expect(page.locator('p.redirect-state')).toHaveText('Redirect state: done');
	});

	test('+layout(.server).js is re-run when server dep is invalidated', async ({ page }) => {
		await page.goto('/load/invalidation/depends');
		const server = await page.textContent('p.server');
		const shared = await page.textContent('p.shared');
		expect(server).toBeDefined();
		expect(shared).toBeDefined();

		await page.click('button.server');
		await page.evaluate(() => window.promise);
		const next_server = await page.textContent('p.server');
		const next_shared = await page.textContent('p.shared');
		expect(server).not.toBe(next_server);
		expect(shared).not.toBe(next_shared);
	});

	test('fetch in server load can be invalidated', async ({ page, app, request }) => {
		await request.get('/load/invalidation/server-fetch/count.json?reset');
		await page.goto('/load/invalidation/server-fetch');
		const selector = '[data-testid="count"]';

		expect(await page.textContent(selector)).toBe('1');
		await app.invalidate('/load/invalidation/server-fetch/count.json');
		expect(await page.textContent(selector)).toBe('2');
	});

	test('+layout.js is re-run when shared dep is invalidated', async ({ page }) => {
		await page.goto('/load/invalidation/depends');
		const server = await page.textContent('p.server');
		const shared = await page.textContent('p.shared');
		expect(server).toBeDefined();
		expect(shared).toBeDefined();

		await page.click('button.shared');
		await page.evaluate(() => window.promise);
		const next_server = await page.textContent('p.server');
		const next_shared = await page.textContent('p.shared');
		expect(server).toBe(next_server);
		expect(shared).not.toBe(next_shared);
	});

	test('Parameter use is tracked even for routes that do not use the parameters', async ({
		page,
		clicknav
	}) => {
		await page.goto('/load/invalidation/params');

		await clicknav('[href="/load/invalidation/params/1"]');
		expect(await page.textContent('pre')).toBe('{"a":"1"}');

		await clicknav('[href="/load/invalidation/params/1/x"]');
		expect(await page.textContent('pre')).toBe('{"a":"1","b":"x"}');

		await page.goBack();
		expect(await page.textContent('pre')).toBe('{"a":"1"}');
	});

	test('route.id use is tracked for server-only load functions', async ({ page, clicknav }) => {
		await page.goto('/load/invalidation/route/server/a');
		expect(await page.textContent('h1')).toBe('route.id: /load/invalidation/route/server/a');

		await clicknav('[href="/load/invalidation/route/server/b"]');
		expect(await page.textContent('h1')).toBe('route.id: /load/invalidation/route/server/b');
	});

	test('route.id use is tracked for shared load functions', async ({ page, clicknav }) => {
		await page.goto('/load/invalidation/route/shared/a');
		expect(await page.textContent('h1')).toBe('route.id: /load/invalidation/route/shared/a');

		await clicknav('[href="/load/invalidation/route/shared/b"]');
		expect(await page.textContent('h1')).toBe('route.id: /load/invalidation/route/shared/b');
	});

	test('route.id does not rerun layout if unchanged', async ({ page, clicknav }) => {
		await page.goto('/load/invalidation/route/shared/unchanged-x');
		expect(await page.textContent('h1')).toBe('route.id: /load/invalidation/route/shared/[x]');
		const id = await page.textContent('h2');

		await clicknav('[href="/load/invalidation/route/shared/unchanged-y"]');
		expect(await page.textContent('h1')).toBe('route.id: /load/invalidation/route/shared/[x]');
		expect(await page.textContent('h2')).toBe(id);
	});

	test('$page.url can safely be mutated', async ({ page }) => {
		await page.goto('/load/mutated-url?q=initial');
		await expect(page.getByText('initial')).toBeVisible();

		await page.locator('button').click();
		await expect(page.getByText('updated')).toBeVisible();
	});
});

test.describe('data-sveltekit attributes', () => {
	test('data-sveltekit-preload-data', async ({ baseURL, page }) => {
		/** @type {string[]} */
		const requests = [];
		page.on('request', (r) => requests.push(r.url()));

		const module = process.env.DEV
			? `${baseURL}/src/routes/data-sveltekit/preload-data/target/+page.svelte`
			: `${baseURL}/_app/immutable/components/pages/data-sveltekit/preload-data/target/_page`;

		await page.goto('/data-sveltekit/preload-data');
		await page.locator('#one').dispatchEvent('mousemove');
		await Promise.all([
			page.waitForTimeout(100), // wait for preloading to start
			page.waitForLoadState('networkidle') // wait for preloading to finish
		]);
		expect(requests.find((r) => r.startsWith(module))).toBeDefined();

		requests.length = 0;
		await page.goto('/data-sveltekit/preload-data');
		await page.locator('#two').dispatchEvent('mousemove');
		await Promise.all([
			page.waitForTimeout(100), // wait for preloading to start
			page.waitForLoadState('networkidle') // wait for preloading to finish
		]);
		expect(requests.find((r) => r.startsWith(module))).toBeDefined();

		requests.length = 0;
		await page.goto('/data-sveltekit/preload-data');
		await page.locator('#three').dispatchEvent('mousemove');
		await Promise.all([
			page.waitForTimeout(100), // wait for preloading to start
			page.waitForLoadState('networkidle') // wait for preloading to finish
		]);
		expect(requests.find((r) => r.startsWith(module))).toBeUndefined();
	});

	test('data-sveltekit-reload', async ({ baseURL, page, clicknav }) => {
		/** @type {string[]} */
		const requests = [];
		page.on('request', (r) => requests.push(r.url()));

		await page.goto('/data-sveltekit/reload');
		await clicknav('#one');
		expect(requests).toContain(`${baseURL}/data-sveltekit/reload/target`);

		requests.length = 0;
		await page.goto('/data-sveltekit/reload');
		await clicknav('#two');
		expect(requests).toContain(`${baseURL}/data-sveltekit/reload/target`);

		requests.length = 0;
		await page.goto('/data-sveltekit/reload');
		await clicknav('#three');
		expect(requests).not.toContain(`${baseURL}/data-sveltekit/reload/target`);
	});

	test('data-sveltekit-noscroll', async ({ page, clicknav }) => {
		await page.goto('/data-sveltekit/noscroll');
		// await page.evaluate(() => window.scrollTo(0, 1000));
		await clicknav('#one');
		expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);

		await page.goto('/data-sveltekit/noscroll');
		await clicknav('#two');
		expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);

		await page.goto('/data-sveltekit/noscroll');
		// await page.evaluate(() => window.scrollTo(0, 1000));
		await clicknav('#three');
		expect(await page.evaluate(() => window.scrollY)).toBe(0);
	});
});

test.describe('Content negotiation', () => {
	test('+server.js next to +page.svelte works', async ({ page }) => {
		await page.goto('/routing/content-negotiation');
		expect(await page.textContent('p')).toBe('Hi');

		for (const method of ['GET', 'PUT', 'PATCH', 'POST', 'DELETE']) {
			await page.click(`button:has-text("${method}")`);
			await page.waitForFunction(
				(method) => document.querySelector('pre')?.textContent === method,
				method
			);
		}
	});

	test('use:enhance uses action, not POST handler', async ({ page }) => {
		await page.goto('/routing/content-negotiation');

		await Promise.all([
			page.waitForResponse('/routing/content-negotiation'),
			page.click('button:has-text("Submit")')
		]);

		await expect(page.locator('[data-testid="form-result"]')).toHaveText('form.submitted: true');
	});
});

test.describe('env in app.html', () => {
	test('can access public env', async ({ page }) => {
		await page.goto('/');
		expect(await page.locator('body').getAttribute('class')).toContain('groovy');
	});
});

test.describe('Snapshots', () => {
	test('recovers snapshotted data', async ({ page, clicknav }) => {
		await page.goto('/snapshot/a');

		let input = page.locator('input');
		await input.type('hello');

		await clicknav('[href="/snapshot/b"]');
		await page.goBack();

		input = page.locator('input');
		expect(await input.inputValue()).toBe('hello');

		await input.clear();
		await input.type('works for cross-document navigations');

		await clicknav('[href="/snapshot/c"]');
		await page.goBack();
		expect(await page.locator('input').inputValue()).toBe('works for cross-document navigations');

		input = page.locator('input');
		await input.clear();
		await input.type('works for reloads');

		await page.reload();
		expect(await page.locator('input').inputValue()).toBe('works for reloads');
	});
});
