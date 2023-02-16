---
title: Zero-config deployments
---

`npm create svelte@latest`로 새 SvelteKit 프로젝트를 생성하면 기본적으로 [`adapter-auto`](https://github.com/sveltejs/kit/tree/master/packages/adapter-auto)가 설치됩니다. . 이 어댑터는 다음을 배포할 때 지원되는 환경에 대해 올바른 어댑터를 자동으로 설치하고 사용합니다.

- [`@sveltejs/adapter-cloudflare`](adapter-cloudflare) for [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [`@sveltejs/adapter-netlify`](adapter-netlify) for [Netlify](https://netlify.com/)
- [`@sveltejs/adapter-vercel`](adapter-vercel) for [Vercel](https://vercel.com/)
- [`svelte-adapter-azure-swa`](https://github.com/geoffrich/svelte-adapter-azure-swa) for [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/)

대상 환경을 결정한 후에는 `devDependencies`에 적절한 어댑터를 설치하는 것이 좋습니다. 이렇게 하면 잠금 파일에 어댑터가 추가되고 CI의 설치 시간이 약간 향상되기 때문입니다.

## Environment-specific configuration

[`adapter-vercel`](adapter-vercel) 및 [`adapter-netlify`](adapter-netlify)에서 `{ edge: true }`와 같은 구성 옵션을 추가하려면 기본 어댑터인 `adapter -auto`는 옵션을 사용하지 않습니다.

## Adding community adapters

[adapters.js](https://github.com/sveltejs/kit/blob/master/packages/adapter-auto/adapters.js)를 편집하고 풀 요청을 열어 추가 어댑터에 대한 제로 구성 지원을 추가할 수 있습니다.