---
title: How do I use HMR with SvelteKit?
---

SvelteKit에는 [svelte-hmr](https://github.com/sveltejs/svelte-hmr)에 의해 기본적으로 활성화된 HMR이 있습니다. [2020 Svelte Summit에서 Rich의 프레젠테이션](https://svelte.dev/blog/whats-the-deal-with-sveltekit)을 보셨다면 더 강력해 보이는 HMR 버전을 보셨을 것입니다. 이 데모에는 `svelte-hmr`의 `preserveLocalState` 플래그가 켜져 있습니다. 이 플래그는 예기치 않은 동작 및 극단적인 경우로 이어질 수 있으므로 기본적으로 해제되어 있습니다. 하지만 걱정하지 마세요. 여전히 SvelteKit으로 HMR을 받고 있습니다! 로컬 상태를 유지하려면 [svelte-hmr](https://github.com/sveltejs/svelte-hmr) 페이지에 설명된 대로 `@hmr:keep` 또는 `@hmr:keep-all` 지시문을 사용할 수 있습니다.
