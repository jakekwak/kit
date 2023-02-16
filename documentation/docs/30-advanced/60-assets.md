---
title: Asset handling
---

## Caching and inlining

성능 향상을 위해 [Vite는 가져온 자산을 자동으로 처리](https://vitejs.dev/guide/assets.html)합니다. 파일 이름에 해시가 추가되어 캐시될 수 있고 `assetsInlineLimit`보다 작은 자산이 인라인될 수 있습니다.

```html
<script>
	import logo from '$lib/assets/logo.png';
</script>

<img alt="The project logo" src={logo} />
```

마크업에서 자산을 직접 참조하는 것을 선호하는 경우 [svelte-preprocess-import-assets](https://github.com/bluwy/svelte-preprocess-import-assets)와 같은 전처리기를 사용할 수 있습니다.

CSS `url()` 함수를 통해 포함된 자산의 경우 [`vitePreprocess`](https://kit.svelte.dev/docs/integrations#preprocessors-vitepreprocess)가 유용할 수 있습니다.

## Transforming

`.webp` 또는 `.avif`와 같은 압축 이미지 형식, 장치마다 크기가 다른 반응형 이미지 또는 개인 정보 보호를 위해 EXIF 데이터가 제거된 이미지를 출력하도록 이미지를 변환할 수 있습니다. 정적으로 포함된 이미지의 경우 [vite-imagetools](https://github.com/JonasKruckenberg/imagetools)와 같은 Vite 플러그인을 사용할 수 있습니다. `Accept` HTTP 헤더 및 쿼리 문자열 매개변수를 기반으로 적절하게 변환된 이미지를 제공할 수 있는 CDN을 고려할 수도 있습니다.
