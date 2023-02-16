---
title: Static site generation
---

SvelteKit을 정적 사이트 생성기(SSG)로 사용하려면 [`adapter-static`](https://github.com/sveltejs/kit/tree/master/packages/adapter-static)을 사용하세요.

이렇게 하면 전체 사이트가 정적 파일 모음으로 사전 렌더링됩니다. 일부 페이지만 사전 렌더링하려면 [`prerender` 옵션](/docs/page-options#prerender)과 함께 다른 어댑터를 사용해야 합니다.

## Usage

`npm i -D @sveltejs/adapter-static`으로 설치한 다음 `svelte.config.js`에 어댑터를 추가합니다.

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-static';
export default {
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: null,
			precompress: false,
			strict: true
		})
	}
};
```

...루트 레이아웃에 [`prerender`](/docs/page-options#prerender) 옵션을 추가합니다.

```js
/// file: src/routes/+layout.js
// This can be false if you're using a fallback (i.e. SPA mode)
export const prerender = true;
```

> SvelteKit의 [`trailingSlash`](/docs/page-options#trailingslash) 옵션이 환경에 맞게 설정되어 있는지 확인해야 합니다. 호스트가 `/a`에 대한 요청을 수신할 때 `/a.html`을 렌더링하지 않으면 대신 `/a/index.html`을 생성하도록 `trailingSlash: 'always'`를 설정해야 합니다.

## Zero-config support

일부 플랫폼에는 제로 구성 지원이 있습니다(향후 추가 예정).

- [Vercel](https://vercel.com)

이러한 플랫폼에서는 `adapter-static`이 최적의 구성을 제공할 수 있도록 어댑터 옵션을 생략해야 합니다.

```diff
/// file: svelte.config.js
export default {
	kit: {
-		adapter: adapter({...}),
+		adapter: adapter(),
		}
	}
};
```

## Options

### pages

미리 렌더링된 페이지를 쓸 디렉터리입니다. 기본값은 `빌드`입니다.

### assets

정적 자산('정적'의 내용과 SvelteKit에서 생성한 클라이언트 측 JS 및 CSS)을 쓸 디렉토리입니다. 일반적으로 이것은 `pages`와 동일해야 하며 `pages`의 값이 무엇이든 기본값이 되지만 드물게 페이지와 자산을 별도의 위치에 출력해야 할 수도 있습니다.

### fallback

SPA 모드에 대한 대체 페이지를 지정합니다. `index.html` 또는 `200.html` 또는 `404.html`.

### precompress

`true`이면 brotli 및 gzip으로 파일을 미리 압축합니다. 그러면 `.br` 및 `.gz` 파일이 생성됩니다.

### strict

기본적으로 `adapter-static`은 앱의 모든 페이지와 엔드포인트(있는 경우)가 사전 렌더링되었는지 또는 `fallback` 옵션이 설정되었는지 확인합니다. 이 확인 기능은 일부 부분이 최종 출력에 포함되지 않기 때문에 액세스할 수 없는 앱을 실수로 게시하는 것을 방지하기 위해 존재합니다. 이것이 괜찮다는 것을 알고 있다면(예를 들어 특정 페이지가 조건부로만 존재하는 경우) `strict`를 `false`로 설정하여 이 검사를 끌 수 있습니다.

## SPA mode

**대체 페이지**를 지정하여 `adapter-static`을 사용하여 단일 페이지 앱 또는 SPA를 만들 수 있습니다.

> 대부분의 상황에서 이것은 권장되지 않습니다. 이는 SEO에 해를 끼치고 인지 성능을 저하시키는 경향이 있으며 JavaScript가 실패하거나 비활성화된 경우 사용자가 앱에 액세스할 수 없게 만듭니다([생각보다 자주 발생](https://kryogenix.org/code/browser/everyonehasjs.html)).
미리 렌더링된 경로가 없는 간단한 SPA를 생성하려는 경우 필요한 구성은 다음과 같습니다.

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-static';
export default {
	kit: {
		adapter: adapter({
			fallback: '200.html'
		}),
		prerender: { entries: [] }
	}
};
```

```js
/// file: src/routes/+layout.js
export const ssr = false;
```

앱의 일부만 SPA로 전환할 수도 있습니다.

다음 옵션을 하나씩 살펴보겠습니다.

### Add fallback page

대체 페이지는 앱을 로드하고 올바른 경로로 이동하는 SvelteKit에서 만든 HTML 페이지입니다. 예를 들어 정적 웹 호스트인 [Surge](https://surge.sh/help/adding-a-200-page-for-client-side-routing)를 사용하면 '200.html' 파일을 추가할 수 있습니다. 정적 자산 또는 미리 렌더링된 페이지에 해당하지 않는 모든 요청을 처리합니다. 다음과 같이 해당 파일을 만들 수 있습니다.

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-static';
export default {
	kit: {
		adapter: adapter({
			fallback: '200.html'
		})
	}
};
```

> 그러나이 동작을 구성하는 방법은 호스팅 솔루션에 따라 다르며 SvelteKit의 일부가 아닙니다. 요청을 리디렉션하는 방법에 대한 호스트의 설명서를 검색하는 것이 좋습니다.

### Turn off prerendering

SPA 모드에서 작동할 때 루트 레이아웃에서 [`prerender`](/docs/page-options#prerender) 옵션을 생략하거나 기본값인 `false`로 설정하고 `prerender` 옵션 세트는 빌드 시 사전 렌더링됩니다.

SvelteKit은 여전히 사전 렌더링 가능한 페이지를 찾는 앱의 진입점을 크롤링합니다. 브라우저 외부에서 로드할 수 없는 페이지로 인해 `svelte-kit 빌드`가 실패하는 경우 `config.kit.prerender.entries`를 `[]`로 설정하여 이러한 일이 발생하지 않도록 할 수 있습니다. (`config.kit.prerender.enabled`를 `false`로 설정해도 이 효과가 있지만 대체 페이지가 생성되지 않습니다.)

다른 부분을 사전 렌더링하려는 경우 앱의 일부에만 사전 렌더링 끄기를 추가할 수도 있습니다.

### Turn off ssr

개발 중에 SvelteKit은 여전히 서버 측 경로 렌더링을 시도합니다. 즉, 브라우저에서만 사용할 수 있는 항목(예: `window` 객체)에 액세스하면 출력 앱에서는 유효하더라도 오류가 발생합니다. SvelteKit의 개발 모드 동작을 SPA에 맞추려면 [add `export const ssr = false`를 루트 `+layout`에 추가](/docs/page-options#ssr)할 수 있습니다. 다른 부분을 미리 렌더링하려는 경우 앱의 일부에만 이 옵션을 추가할 수도 있습니다.

### Apache

[Apache](https://httpd.apache.org/)에서 SPA를 실행하려면 `static/.htaccess` 파일을 추가하여 요청을 대체 페이지로 라우팅해야 합니다.

```
<IfModule mod_rewrite.c>
	RewriteEngine On
	RewriteBase /
	RewriteRule ^200\.html$ - [L]
	RewriteCond %{REQUEST_FILENAME} !-f
	RewriteCond %{REQUEST_FILENAME} !-d
	RewriteRule . /200.html [L]
</IfModule>
```

## GitHub Pages

GitHub 페이지용으로 빌드할 때 사이트가 루트가 아닌 <https://your-username.github.io/your-repo-name>에서 제공되므로 리포지토리 이름과 일치하도록 [`paths.base`](/docs/configuration#paths)를 업데이트해야 합니다.

정적 폴더에 빈 `.nojekyll` 파일을 넣어 GitHub에서 제공하는 Jekyll이 사이트를 관리하지 못하도록 해야 합니다. Jekyll을 비활성화하지 않으려면 키트의 `appDir` 구성 옵션을 `'app_'` 또는 밑줄로 시작하지 않는 항목으로 변경하십시오. 자세한 내용은 GitHub의 [Jekyll 문서](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll#configuring-jekyll-in-your-github-pages-site)를 참조하세요.

GitHub 페이지의 구성은 다음과 같습니다.

```js
/// file: svelte.config.js
const dev = process.argv.includes('dev');
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		paths: {
			base: dev ? '' : '/your-repo-name',
		},
		// If you are not using a .nojekyll file, change your appDir to something not starting with an underscore.
		// For example, instead of '_app', use 'app_', 'internal', etc.
		appDir: 'internal',
	}
};
```