---
title: Service workers
---

서비스 워커는 앱 내에서 네트워크 요청을 처리하는 프록시 서버 역할을 합니다. 이를 통해 앱이 오프라인에서 작동하도록 할 수 있지만 오프라인 지원이 필요하지 않거나(또는 빌드 중인 앱 유형으로 인해 현실적으로 구현할 수 없는 경우) 속도를 높이기 위해 서비스 워커를 사용할 가치가 있는 경우가 많습니다. 빌드된 JS 및 CSS를 미리 캐싱하여 탐색합니다.

SvelteKit에서 `src/service-worker.js` 파일(또는 `src/service-worker.ts`, `src/service-worker/index.js` 등)이 있으면 번들되어 자동으로 등록됩니다. 필요한 경우 [서비스 워커의 위치](/docs/configuration#files)를 변경할 수 있습니다.

자체 로직으로 서비스 워커를 등록하거나 다른 솔루션을 사용해야 하는 경우 [자동 등록 비활성화](/docs/configuration#serviceworker)를 할 수 있습니다. 기본 등록은 다음과 같습니다.

```js
if ('serviceWorker' in navigator) {
	addEventListener('load', function () {
		navigator.serviceWorker.register('./path/to/service-worker.js');
	});
}
```

서비스 워커 내에서 [`$service-worker` 모듈](/docs/modules#$service-worker)에 액세스할 수 있습니다. 이 모듈은 모든 정적 애셋, 빌드 파일 및 미리 렌더링된 페이지에 대한 경로를 제공합니다. 고유한 캐시 이름을 만드는 데 사용할 수 있는 앱 버전 문자열도 제공됩니다. Vite 구성이 `define`(전역 변수 교체에 사용됨)을 지정하면 서버/클라이언트 빌드뿐만 아니라 서비스 워커에도 적용됩니다.

다음 예제는 빌드된 앱과 `정적`의 모든 파일을 열심히 캐시하고 다른 모든 요청이 발생하면 캐시합니다. 이렇게 하면 각 페이지를 방문한 후 오프라인에서 작동하게 됩니다.

```js
// @errors: 2339
import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files  // everything in `static`
];

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			return cache.match(event.request);
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch {
			return cache.match(event.request);
		}
	}

	event.respondWith(respond());
});
```

> 캐싱할 때 주의하세요! 경우에 따라 오래된 데이터는 오프라인 상태에서 사용할 수 없는 데이터보다 나쁠 수 있습니다. 브라우저는 캐시가 가득 차면 캐시를 비우므로 비디오 파일과 같은 큰 자산을 캐싱할 때도 주의해야 합니다.

서비스 워커는 생산을 위해 번들로 제공되지만 개발 중에는 번들로 제공되지 않습니다. 따라서 [서비스 워커의 모듈](https://web.dev/es-modules-in-sw)을 지원하는 브라우저만 개발 시 모듈을 사용할 수 있습니다. 서비스 워커를 수동으로 등록하는 경우 개발 단계에서 `{ type: 'module' }` 옵션을 전달해야 합니다.

```js
import { dev } from '$app/environment';

navigator.serviceWorker.register('/service-worker.js', {
	type: dev ? 'module' : 'classic'
});
```

> `build` 및 `prerendered`는 개발 중 빈 배열입니다.

SvelteKit의 서비스 작업자 구현은 의도적으로 낮은 수준입니다. 보다 완벽하면서도 독단적인 솔루션이 필요한 경우 [Workbox](https://web.dev/learn/pwa/workbox)를 사용하는 [Vite PWA 플러그인](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html)과 같은 솔루션을 살펴보는 것이 좋습니다. 서비스 워커에 대한 보다 일반적인 정보는 [MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)를 권장합니다.