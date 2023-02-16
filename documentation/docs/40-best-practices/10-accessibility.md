---
title: Accessibility
---

SvelteKit은 기본적으로 앱에 액세스 가능한 플랫폼을 제공하기 위해 노력합니다. Svelte의 [컴파일 시간 접근성 검사](https://svelte.dev/docs#accessibility-warnings)는 빌드하는 모든 SvelteKit 애플리케이션에도 적용됩니다.

다음은 SvelteKit의 기본 제공 접근성 기능이 작동하는 방식과 이러한 기능이 최대한 잘 작동하도록 돕기 위해 수행해야 하는 작업입니다. SvelteKit은 액세스 가능한 기반을 제공하지만 여전히 애플리케이션 코드에 액세스할 수 있는지 확인해야 할 책임이 있음을 명심하십시오. 접근성을 처음 사용하는 경우 이 가이드의 ["추가 정보"](/docs/accessibility#further-reading) 섹션에서 추가 리소스를 참조하세요.

우리는 접근성이 제대로 작동하기 어려울 수 있음을 알고 있습니다. SvelteKit이 접근성을 처리하는 방법에 대한 개선 사항을 제안하려면 [GitHub 문제 열기](https://github.com/sveltejs/kit/issues)를 참조하세요.

## Route announcements

기존의 서버 렌더링 애플리케이션에서는 모든 탐색(예: `<a>` 태그 클릭)이 전체 페이지 다시 로드를 트리거합니다. 이 경우 사용자가 페이지가 변경되었음을 알 수 있도록 스크린 리더 및 기타 보조 기술이 새 페이지의 제목을 읽습니다.

SvelteKit의 페이지 간 탐색은 페이지를 다시 로드하지 않고([클라이언트측 라우팅](/docs/glossary#routing)이라고 함) 발생하므로 SvelteKit은 각 탐색 후 새 페이지 이름을 읽을 페이지에 [라이브 영역]을 삽입합니다. 이는 `<title>` 요소를 검사하여 발표할 페이지 이름을 결정합니다.


이 동작으로 인해 앱의 모든 페이지에는 고유하고 설명이 포함된 제목이 있어야 합니다. SvelteKit에서는 각 페이지에 `<svelte:head>` 요소를 배치하여 이를 수행할 수 있습니다.

```svelte
/// file: src/routes/+page.svelte
<svelte:head>
	<title>Todo List</title>
</svelte:head>
```

이렇게 하면 화면 판독기 및 기타 보조 기술이 탐색이 발생한 후 새 페이지를 식별할 수 있습니다. 설명이 포함된 제목을 제공하는 것은 [SEO](/docs/seo#manual-setup-title-and-meta)에도 중요합니다.

## Focus management

기존의 서버 렌더링 애플리케이션에서는 모든 탐색이 페이지 상단으로 포커스를 재설정합니다. 이렇게 하면 키보드나 스크린 리더로 웹을 탐색하는 사람들이 처음부터 페이지와 상호 작용할 수 있습니다.

클라이언트 측 라우팅 중에 이 동작을 시뮬레이션하기 위해 SvelteKit은 각 탐색 및 [향상된 양식 제출](https://kit.svelte.dev/docs/form-actions#progressive-enhancement) 후에 `<body>` 요소에 중점을 둡니다. 한 가지 예외가 있습니다. [`autofocus`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autofocus) 속성이 있는 요소가 있는 경우 SvelteKit은 대신 해당 요소에 초점을 맞춥니다. . 해당 속성을 사용할 때 [보조 기술에 대한 영향을 고려](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autofocus#accessibility_considerations)해야 합니다.

SvelteKit의 포커스 관리를 사용자 지정하려면 `afterNavigate` 후크를 사용할 수 있습니다.

```js
/// <reference types="@sveltejs/kit" />
// ---cut---
import { afterNavigate } from '$app/navigation';

afterNavigate(() => {
	/** @type {HTMLElement | null} */
	const to_focus = document.querySelector('.focus-me');
	to_focus?.focus();
});
```

[`goto`](/docs/modules#$app-navigation-goto) 함수를 사용하여 프로그래밍 방식으로 다른 페이지로 이동할 수도 있습니다. 기본적으로 이것은 링크를 클릭하는 것과 동일한 클라이언트 측 라우팅 동작을 갖습니다. 그러나 `goto`는 포커스를 재설정하는 대신 현재 포커스가 있는 요소를 유지하는 `keepFocus` 옵션도 허용합니다. 이 옵션을 활성화하면 현재 포커스가 있는 요소가 탐색 후에도 페이지에 여전히 존재하는지 확인하십시오. 요소가 더 이상 존재하지 않으면 사용자의 초점을 잃게 되어 보조 기술 사용자에게 혼란스러운 경험이 됩니다.

## The "lang" attribute

기본적으로 SvelteKit의 페이지 템플릿은 문서의 기본 언어를 영어로 설정합니다. 콘텐츠가 영어로 되어 있지 않은 경우 올바른 [`lang`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang#accessibility) 속성을 갖도록 `src/app.html`의 `<html>` 요소를 업데이트해야 합니다. 이렇게 하면 문서를 읽는 모든 보조 기술이 정확한 발음을 사용하게 됩니다. 예를 들어 콘텐츠가 독일어인 경우 'app.html'을 다음과 같이 업데이트해야 합니다.

```html
/// file: src/app.html
<html lang="de">
```

콘텐츠가 여러 언어로 제공되는 경우 현재 페이지의 언어를 기반으로 `lang` 속성을 설정해야 합니다. SvelteKit의 [handle hook](/docs/hooks#server-hooks-handle)을 사용하여 이 작업을 수행할 수 있습니다.

```html
/// file: src/app.html
<html lang="%lang%">
```

```js
/// file: src/hooks.server.js
/**
 * @param {import('@sveltejs/kit').RequestEvent} event
 */
function get_lang(event) {
	return 'en';
}
// ---cut---
/** @type {import('@sveltejs/kit').Handle} */
export function handle({ event, resolve }) {
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', get_lang(event))
	});
}
```

## Further reading

대부분의 경우 액세스 가능한 SvelteKit 앱을 빌드하는 것은 액세스 가능한 웹 앱을 빌드하는 것과 동일합니다. 다음 일반 접근성 리소스의 정보를 구축하는 모든 웹 환경에 적용할 수 있어야 합니다.

- [MDN 웹 문서: 접근성](https://developer.mozilla.org/en-US/docs/Learn/Accessibility)
- [A11y 프로젝트](https://www.a11yproject.com/)
- [WCAG 충족 방법(빠른 참조)](https://www.w3.org/WAI/WCAG21/quickref/)
