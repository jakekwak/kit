---
title: Introduction
---

## Before we begin

> Svelte 또는 SvelteKit을 처음 사용하는 경우 (실험적!) [대화형 자습서](https://learn.svelte.dev)를 확인하는 것이 좋습니다.
>
> 막히면 [Discord 채팅방](https://svelte.dev/chat)에서 도움을 요청하세요.

## What is SvelteKit?

SvelteKit은 [Svelte](https://svelte.dev/)를 사용하여 강력하고 성능이 뛰어난 웹 애플리케이션을 빠르게 개발하기 위한 프레임워크입니다.

## What is Svelte?

즉, Svelte는 사용자가 브라우저에서 보고 상호 작용하는 탐색 모음, 댓글 섹션 또는 연락처 양식과 같은 사용자 인터페이스 구성 요소를 작성하는 방법입니다. Svelte 컴파일러는 구성 요소를 페이지의 HTML을 렌더링하기 위해 실행할 수 있는 JavaScript와 페이지의 스타일을 지정하는 CSS로 변환합니다. 이 가이드의 나머지 부분을 이해하기 위해 Svelte를 알 필요는 없지만 도움이 될 것입니다. 자세히 알아보려면 [Svelte 자습서](https://svelte.dev/tutorial)를 확인하세요.

## What does SvelteKit provide on top of Svelte?

Svelte는 UI 구성 요소를 렌더링합니다. Svelte만으로도 이러한 구성 요소를 구성하고 전체 페이지를 렌더링할 수 있지만 전체 앱을 작성하려면 Svelte 이상의 것이 필요합니다.

SvelteKit은 [라우터](/docs/glossary#routing) 및 [서버 측 렌더링(SSR)](/docs/glossary#ssr)과 같은 기본 기능을 제공합니다. 그러나 그 이상으로 모든 최신 모범 사례를 사용하여 앱을 구축하는 것은 엄청나게 복잡합니다. 이러한 사례에는 최소한의 필수 코드만 로드할 수 있도록 [빌드 최적화](https://vitejs.dev/guide/features.html#build-optimizations)가 포함됩니다; [오프라인 지원](/docs/service-workers); 사용자가 탐색을 시작하기 전에 페이지를 [미리 로드](/docs/link-options#data-sveltekit-preload-data)합니다; SSR을 사용하여 서버에서, 브라우저 [클라이언트 측 렌더링](/docs/glossary#csr)에서 또는 사전 렌더링을 사용하여 빌드 시에 앱의 다른 부분을 렌더링할 수 있는 [구성 가능한 렌더링](/docs/page-options) 그리고 다른 많은 것들. SvelteKit은 모든 지루한 작업을 수행하므로 창의적인 부분을 계속할 수 있습니다.

[Svelte 플러그인](https://github.com/sveltejs/vite-plugin-svelte)과 함께 [Vite](https://vitejs.dev/)를 사용하여 코드 변경 사항이 브라우저에 즉시 반영되는 [HMR(Hot Module Replacement)](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#hot)로 번개처럼 빠르고 기능이 풍부한 개발 경험을 제공합니다.
