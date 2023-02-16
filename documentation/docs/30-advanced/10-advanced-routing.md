---
title: Advanced routing
---

## Rest parameters

경로 세그먼트의 수를 알 수 없는 경우 나머지 구문을 사용할 수 있습니다. 예를 들어 다음과 같이 GitHub의 파일 뷰어를 구현할 수 있습니다.

```bash
/[org]/[repo]/tree/[branch]/[...file]
```

...이 경우 `/sveltejs/kit/tree/master/documentation/docs/04-advanced-routing.md`에 대한 요청으로 인해 페이지에서 다음 매개변수를 사용할 수 있습니다.

```js
// @noErrors
{
	org: 'sveltejs',
	repo: 'kit',
	branch: 'master',
	file: 'documentation/docs/04-advanced-routing.md'
}
```

> `src/routes/a/[...rest]/z/+page.svelte`는 `/a/z`(즉, 매개변수가 전혀 없음)뿐만 아니라 `/a/b/z` 및 `/a/b/c/z` 등과도 일치합니다. 예를 들어 [matcher](#matching)를 사용하여 나머지 매개변수의 값이 유효한지 확인하십시오.

### 404 pages

나머지 매개변수를 사용하면 맞춤 404를 렌더링할 수도 있습니다. 이러한 경로를 감안할 때...

```
src/routes/
├ marx-brothers/
│ ├ chico/
│ ├ harpo/
│ ├ groucho/
│ └ +error.svelte
└ +error.svelte
```

...일치하는 경로가 없기 때문에 `/marx-brothers/karl`을 방문하면 `marx-brothers/+error.svelte` 파일이 렌더링되지 _않습니다_. 중첩된 오류 페이지를 렌더링하려면 `/marx-brothers/*` 요청과 일치하는 경로를 만들고 여기에서 404를 반환해야 합니다.

```diff
src/routes/
├ marx-brothers/
+| ├ [...path]/
│ ├ chico/
│ ├ harpo/
│ ├ groucho/
│ └ +error.svelte
└ +error.svelte
```

```js
/// file: src/routes/marx-brothers/[...path]/+page.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load(event) {
	throw error(404, 'Not Found');
}
```

> 404 케이스를 처리하지 않으면 [`handleError`](/docs/hooks#shared-hooks-handleerror)에 표시됩니다.

## Optional parameters

`[lang]/home`과 같은 경로에는 필수인 `lang`이라는 매개변수가 포함되어 있습니다. 경우에 따라 이러한 매개 변수를 선택 사항으로 지정하여 이 예에서 `home`과 `en/home`이 모두 동일한 페이지를 가리키도록 하는 것이 좋습니다. `[[lang]]/home`과 같이 다른 대괄호 쌍으로 매개변수를 래핑하여 이를 수행할 수 있습니다.

선택적 경로 매개변수는 나머지 매개변수(`[...rest]/[[optional]]`)를 따를 수 없습니다. 매개변수가 '탐욕스럽게' 일치되고 선택적 매개변수는 항상 사용되지 않기 때문입니다.

## Matching

`src/routes/archive/[page]`와 같은 경로는 `/archive/3`과 일치하지만 `/archive/potato`와도 일치합니다. 우리는 그것을 원하지 않습니다. [`params`] 디렉토리에 _matcher_를 — 매개변수 문자열(`"3"` 또는 `"potato"`)을 사용하고 유효한 경우 `true`를 반환합니다 — 추가하여 경로 매개변수가 올바른 형식인지 확인할 수 있습니다...

```js
/// file: src/params/integer.js
/** @type {import('@sveltejs/kit').ParamMatcher} */
export function match(param) {
	return /^\d+$/.test(param);
}
```

...경로를 보강합니다.

```diff
-src/routes/archive/[page]
+src/routes/archive/[page=integer]
```

경로 이름이 일치하지 않으면 SvelteKit은 결국 404를 반환하기 전에 다른 경로를 일치시키려고 시도합니다(아래에 지정된 정렬 순서 사용).

> Matcher는 서버와 브라우저 모두에서 실행됩니다.

## Sorting

여러 경로가 지정된 경로와 일치할 수 있습니다. 예를 들어 이러한 각 경로는 `/foo-abc`와 일치합니다.

```bash
src/routes/[...catchall]/+page.svelte
src/routes/[[a=x]]/+page.svelte
src/routes/[b]/+page.svelte
src/routes/foo-[c]/+page.svelte
src/routes/foo-abc/+page.svelte
```

SvelteKit은 어떤 경로가 요청되고 있는지 알아야 합니다. 이를 위해 다음 규칙에 따라 정렬합니다...

- 보다 구체적인 경로가 우선 순위가 더 높습니다(예: 매개변수가 없는 경로는 동적 매개변수가 하나인 경로보다 더 구체적임).
- [matchers](#matching)(`[name=type]`)가 있는 매개변수는 (`[name]`)이 없는 매개변수보다 우선순위가 높습니다.
- `[[optional]]` 및 `[...rest]` 매개변수는 경로의 마지막 부분이 아닌 한 무시되며, 이 경우 가장 낮은 우선순위로 처리됩니다. 즉, `x/[[y]]/z`는 정렬을 위해 `x/z`와 동등하게 취급됩니다.
- 타이는 알파벳순으로 해결됩니다.

이 순서는 `/foo-abc`가 `src/routes/foo-abc/+page.svelte`를 호출하고 `/foo-def`가 덜 구체적인 경로가 아닌 `src/routes/foo-[c]/+page.svelte`를 호출함을 의미합니다.

```bash
src/routes/foo-abc/+page.svelte
src/routes/foo-[c]/+page.svelte
src/routes/[[a=x]]/+page.svelte
src/routes/[b]/+page.svelte
src/routes/[...catchall]/+page.svelte
```

## Encoding

일부 문자는 파일 시스템에서 사용할 수 없습니다 — Linux 및 Mac에서는 `/`, Windows에서는 `\ / : * ? " < > |`. `#` 및 `%` 문자는 URL에서 특별한 의미가 있으며 `[ ] ( )` 문자는 SvelteKit에 특별한 의미가 있으므로 경로의 일부로 직접 사용할 수 없습니다.

경로에서 이러한 문자를 사용하려면 `[x+nn]` 형식의 16진수 이스케이프 시퀀스를 사용할 수 있습니다. 여기서 `nn`은 16진수 문자 코드입니다.

- `\` — `[x+5c]`
- `/` — `[x+2f]`
- `:` — `[x+3a]`
- `*` — `[x+2a]`
- `?` — `[x+3f]`
- `"` — `[x+22]`
- `<` — `[x+3c]`
- `>` — `[x+3e]`
- `|` — `[x+7c]`
- `#` — `[x+23]`
- `%` — `[x+25]`
- `[` — `[x+5b]`
- `]` — `[x+5d]`
- `(` — `[x+28]`
- `)` — `[x+29]`

예를 들어 `/smileys/:-)` 경로를 만들려면 `src/routes/smileys/[x+3a]-[x+29]/+page.svelte` 파일을 만듭니다.

JavaScript를 사용하여 문자의 16진수 코드를 결정할 수 있습니다.

```js
':'.charCodeAt(0).toString(16); // '3a', hence '[x+3a]'
```

유니코드 이스케이프 시퀀스를 사용할 수도 있습니다. 일반적으로 인코딩되지 않은 문자를 직접 사용할 수 있으므로 필요하지 않지만 어떤 이유로 이모티콘이 포함된 파일 이름을 사용할 수 없는 경우 이스케이프 문자를 사용할 수 있습니다. 즉, 다음과 같습니다.

```
src/routes/[u+d83e][u+dd2a]/+page.svelte
src/routes/🤪/+page.svelte
```

유니코드 이스케이프 시퀀스의 형식은 `[u+nnnn]`이며 여기서 `nnnn`은 `0000`과 `10ffff` 사이의 유효한 값입니다. (JavaScript 문자열 이스케이프와 달리 `ffff` 위의 코드 포인트를 나타내기 위해 서로게이트 쌍을 사용할 필요가 없습니다.) 유니코드 인코딩에 대한 자세한 내용은 [프로그래밍 with 유니코드](https://unicodebook.readthedocs.io/unicode_encodings.html)를 참조하세요. ).

> TypeScript [struggles](https://github.com/microsoft/TypeScript/issues/13399) 디렉터리 앞에 `.` 문자가 있기 때문에 이러한 문자를 인코딩하는 것이 유용할 수 있습니다. [`.well-known`](https://en.wikipedia.org/wiki/Well-known_URI) 경로: `src/routes/[x+2e]well-known/...`

## Advanced layouts

기본적으로 _layout 계층 구조_는 경로 계층 구조를 미러링합니다. 경우에 따라 원하는 것이 아닐 수도 있습니다.

### (group)

하나의 레이아웃(예: `/dashboard` 또는 `/item`)을 가져야 하는 'app' 경로인 일부 경로와 다른 레이아웃을 가져야 하는 'marketing' 경로인 다른 경로(`/blog` 또는 ` /testimonials`)가 있을 수 있습니다. 이름이 괄호로 묶인 디렉토리로 이러한 경로를 그룹화할 수 있습니다. 일반 디렉토리와 달리 `(app)` 및 `(marketing)`은 내부 경로의 URL 경로 이름에 영향을 미치지 않습니다:

```diff
src/routes/
+│ (app)/
│ ├ dashboard/
│ ├ item/
│ └ +layout.svelte
+│ (marketing)/
│ ├ about/
│ ├ testimonials/
│ └ +layout.svelte
├ admin/
└ +layout.svelte
```

예를 들어 `/`가 `(app)` 또는 `(marketing)` 페이지여야 하는 경우 `(group)` 내부에 `+page`를 직접 넣을 수도 있습니다.

### Breaking out of layouts

루트 레이아웃은 앱의 모든 페이지에 적용됩니다. 생략할 경우 기본값은 `<slot />`입니다. 일부 페이지가 나머지 페이지와 다른 레이아웃 계층 구조를 가지도록 하려면 공통 레이아웃을 상속하지 않아야 하는 경로를 _제외_하고 전체 앱을 하나 이상의 그룹에 넣을 수 있습니다.

위의 예에서 `/admin` 경로는 `(app)` 또는 `(marketing)` 레이아웃을 상속하지 않습니다.

### +page@

페이지는 경로별로 현재 레이아웃 계층에서 벗어날 수 있습니다. 이전 예제의 `(app)` 그룹 내에 `/item/[id]/embed` 경로가 있다고 가정합니다.

```diff
src/routes/
├ (app)/
│ ├ item/
│ │ ├ [id]/
│ │ │ ├ embed/
+│ │ │ │ └ +page.svelte
│ │ │ └ +layout.svelte
│ │ └ +layout.svelte
│ └ +layout.svelte
└ +layout.svelte
```

일반적으로 이것은 루트 레이아웃, `(app)` 레이아웃, `item` 레이아웃 및 `[id]` 레이아웃을 상속합니다. 세그먼트 이름 뒤에 `@`를 추가하거나 루트 레이아웃의 경우 빈 문자열을 추가하여 이러한 레이아웃 중 하나로 재설정할 수 있습니다. 이 예에서는 다음 옵션 중에서 선택할 수 있습니다.

- `+page@[id].svelte` - inherits from `src/routes/(app)/item/[id]/+layout.svelte`
- `+page@item.svelte` - inherits from `src/routes/(app)/item/+layout.svelte`
- `+page@(app).svelte` - inherits from `src/routes/(app)/+layout.svelte`
- `+page@.svelte` - inherits from `src/routes/+layout.svelte`

```diff
src/routes/
├ (app)/
│ ├ item/
│ │ ├ [id]/
│ │ │ ├ embed/
+│ │ │ │ └ +page@(app).svelte
│ │ │ └ +layout.svelte
│ │ └ +layout.svelte
│ └ +layout.svelte
└ +layout.svelte
```

### +layout@

페이지와 마찬가지로 레이아웃은 동일한 기술을 사용하여 상위 레이아웃 계층 구조에서 _자체_ 분리될 수 있습니다. 예를 들어 `+layout@.svelte` 구성 요소는 모든 하위 경로에 대한 계층 구조를 재설정합니다.

```
src/routes/
├ (app)/
│ ├ item/
│ │ ├ [id]/
│ │ │ ├ embed/
│ │ │ │ └ +page.svelte  // uses (app)/item/[id]/+layout.svelte
│ │ │ ├ +layout.svelte  // inherits from (app)/item/+layout@.svelte
│ │ │ └ +page.svelte    // uses (app)/item/+layout@.svelte
│ │ └ +layout@.svelte   // inherits from root layout, skipping (app)/+layout.svelte
│ └ +layout.svelte
└ +layout.svelte
```

### When to use layout groups

모든 사용 사례가 레이아웃 그룹화에 적합한 것은 아니며 사용 사례를 강요해서는 안 됩니다. 사용 사례로 인해 복잡한 `(group)` 중첩이 발생하거나 단일 이상값에 대해 `(group)`을 도입하고 싶지 않을 수 있습니다. 구성(재사용 가능한 '로드' 함수 또는 Svelte 구성 요소) 또는 if 문과 같은 다른 수단을 사용하여 원하는 것을 달성하는 것은 전혀 문제가 없습니다. 다음 예는 루트 레이아웃으로 되감고 다른 레이아웃에서도 사용할 수 있는 구성 요소와 기능을 재사용하는 레이아웃을 보여줍니다.

```svelte
/// file: src/routes/nested/route/+layout@.svelte
<script>
	import ReusableLayout from '$lib/ReusableLayout.svelte';
	export let data;
</script>

<ReusableLayout {data}>
	<slot />
</ReusableLayout>
```

```js
/// file: src/routes/nested/route/+layout.js
// @filename: ambient.d.ts
declare module "$lib/reusable-load-function" {
	export function reusableLoad(event: import('@sveltejs/kit').LoadEvent): Promise<Record<string, any>>;
}
// @filename: index.js
// ---cut---
import { reusableLoad } from '$lib/reusable-load-function';

/** @type {import('./$types').PageLoad} */
export function load(event) {
	// Add additional logic here, if needed
	return reusableLoad(event);
}
```
