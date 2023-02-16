---
title: Types
---

## Public types

다음 유형은 `@sveltejs/kit`에서 가져올 수 있습니다.

> TYPES: @sveltejs/kit

## Private types

다음은 위에 문서화된 공개 형식에서 참조하지만 직접 가져올 수는 없습니다.

> TYPES: Private types

## Generated types

`RequestHandler` 및 `Load` 유형은 둘 다 `params` 개체를 입력할 수 있도록 하는 `Params` 인수를 허용합니다. 예를 들어 이 끝점에는 `foo`, `bar` 및 `baz` 매개변수가 필요합니다.

```js
/// file: src/routes/[foo]/[bar]/[baz]/+page.server.js
// @errors: 2355 2322 1360
/** @type {import('@sveltejs/kit').RequestHandler<{
 *   foo: string;
 *   bar: string;
 *   baz: string
 * }>} */
export async function GET({ params }) {
	// ...
}
```

말할 필요도 없이 이것은 작성하기 번거롭고 이식성이 떨어집니다(`[foo]` 디렉토리의 이름을 `[qux]`로 바꾸면 유형이 더 이상 현실을 반영하지 않습니다).

이 문제를 해결하기 위해 SvelteKit은 각 엔드포인트 및 페이지에 대해 `.d.ts` 파일을 생성합니다.

```ts
/// file: .svelte-kit/types/src/routes/[foo]/[bar]/[baz]/$types.d.ts
/// link: false
import type * as Kit from '@sveltejs/kit';

type RouteParams = {
	foo: string;
	bar: string;
	baz: string;
}

export type PageServerLoad = Kit.ServerLoad<RouteParams>;
export type PageLoad = Kit.Load<RouteParams>;
```

이러한 파일은 TypeScript 구성의 [`rootDirs`](https://www.typescriptlang.org/tsconfig#rootDirs) 옵션 덕분에 끝점과 페이지에 형제로 가져올 수 있습니다.

```js
/// file: src/routes/[foo]/[bar]/[baz]/+page.server.js
// @filename: $types.d.ts
import type * as Kit from '@sveltejs/kit';

type RouteParams = {
	foo: string;
	bar: string;
	baz: string;
}

export type PageServerLoad = Kit.ServerLoad<RouteParams>;

// @filename: index.js
// @errors: 2355
// ---cut---
/** @type {import('./$types').PageServerLoad} */
export async function GET({ params }) {
	// ...
}
```

```js
/// file: src/routes/[foo]/[bar]/[baz]/+page.js
// @filename: $types.d.ts
import type * as Kit from '@sveltejs/kit';

type RouteParams = {
	foo: string;
	bar: string;
	baz: string;
}

export type PageLoad = Kit.Load<RouteParams>;

// @filename: index.js
// @errors: 2355
// ---cut---
/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	// ...
}
```

> 이것이 작동하려면 자신의 `tsconfig.json` 또는 `jsconfig.json`이 생성된 `.svelte-kit/tsconfig.json`에서 확장되어야 합니다(여기서 `.svelte-kit`은 [`outDir`](/docs/configuration#outdir)):
>
>     { "extends": "./.svelte-kit/tsconfig.json" }

### Default tsconfig.json

생성된 `.svelte-kit/tsconfig.json` 파일에는 여러 옵션이 포함되어 있습니다. 일부는 프로젝트 구성에 따라 프로그래밍 방식으로 생성되며 일반적으로 합당한 이유 없이 재정의하면 안 됩니다.

```json
/// file: .svelte-kit/tsconfig.json
{
	"compilerOptions": {
		"baseUrl": "..",
		"paths": {
			"$lib": "src/lib",
			"$lib/*": "src/lib/*"
		},
		"rootDirs": ["..", "./types"]
	},
	"include": ["../src/**/*.js", "../src/**/*.ts", "../src/**/*.svelte"],
	"exclude": ["../node_modules/**", "./**"]
}
```

다른 것들은 SvelteKit이 제대로 작동하는 데 필요하며 수행 중인 작업을 알지 못하는 경우 그대로 두어야 합니다.

```json
/// file: .svelte-kit/tsconfig.json
{
	"compilerOptions": {
		// this ensures that types are explicitly
		// imported with `import type`, which is
		// necessary as svelte-preprocess cannot
		// otherwise compile components correctly
		"importsNotUsedAsValues": "error",

		// Vite compiles one TypeScript module
		// at a time, rather than compiling
		// the entire module graph
		"isolatedModules": true,

		// TypeScript cannot 'see' when you
		// use an imported value in your
		// markup, so we need this
		"preserveValueImports": true,

		// This ensures both `vite build`
		// and `svelte-package` work correctly
		"lib": ["esnext", "DOM", "DOM.Iterable"],
		"moduleResolution": "node",
		"module": "esnext",
		"target": "esnext"
	}
}
```

## App

> TYPES: App
