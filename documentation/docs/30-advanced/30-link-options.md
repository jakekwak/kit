---
title: Link options
---

SvelteKit에서 `<a>` 요소(프레임워크별 `<Link>` 구성 요소가 아님)는 앱의 경로 사이를 탐색하는 데 사용됩니다. 사용자가 'href'가 앱에서 '소유'한 링크를(예를 들어 외부 사이트에 대한 링크와 반대) 클릭하면 SvelteKit은 코드를 가져온 다음 데이터를 가져오는 데 필요한 `load` 함수를 호출하여 새 페이지로 이동합니다.

`data-sveltekit-*` 속성을 사용하여 링크의 동작을 사용자 정의할 수 있습니다. 이들은 `<a>` 자체 또는 상위 요소에 적용될 수 있습니다.

## data-sveltekit-preload-data

브라우저가 사용자가 링크를 클릭했다고 등록하기 전에 사용자가 링크 위에 마우스를 올려놓았는지(데스크탑에서) `touchstart` 또는 `mousedown` 이벤트가 트리거되었는지 감지할 수 있습니다. 두 경우 모두 `click` 이벤트가 올 것이라는 교육적인 추측을 할 수 있습니다.

SvelteKit은 이 정보를 사용하여 코드를 가져오고 페이지의 데이터를 가져오는 데 유리한 출발을 할 수 있습니다. 이렇게 하면 지연되는 사용자 인터페이스와 빠른 사용자 인터페이스의 차이인 수백 밀리초의 추가 시간을 얻을 수 있습니다.

다음 두 값 중 하나를 가질 수 있는 `data-sveltekit-preload-data` 속성으로 이 동작을 제어할 수 있습니다.

- `"hover"`는 마우스가 링크 위에 정지하면 사전 로드가 시작됨을 의미합니다. 모바일에서는 `touchstart`에서 사전 로드가 시작됩니다.
- `"tap"`은 `touchstart` 또는 `mousedown` 이벤트가 등록되는 즉시 사전 로드가 시작됨을 의미합니다.

기본 프로젝트 템플릿에는 `src/app.html`의 `<body>` 요소에 적용된 `data-sveltekit-preload-data="hover"` 속성이 있습니다. 즉, 모든 링크는 기본적으로 마우스 오버 시 미리 로드됩니다.

```html
<body data-sveltekit-preload-data="hover">
	<div style="display: contents">%sveltekit.body%</div>
</body>
```

경우에 따라 사용자가 링크 위로 마우스를 가져갈 때 `load`를 호출하는 것이 바람직하지 않을 수 있습니다. 그 이유는 잘못된 긍정(클릭이 마우스 오버를 따라갈 필요가 없음)이 발생할 가능성이 높거나 데이터가 매우 빠르게 업데이트되고 지연이 부실함을 의미할 수 있기 때문입니다.

이러한 경우 사용자가 링크를 탭하거나 클릭할 때만 SvelteKit이 `load`를 호출하도록 하는 `"tap"` 값을 지정할 수 있습니다.

```html
<a data-sveltekit-preload-data="tap" href="/stonks">
	Get current stonk values
</a>
```

> 프로그래밍 방식으로 `$app/navigation`에서 `preloadData`를 호출할 수도 있습니다.

사용자가 데이터 사용량 감소를 선택한 경우 데이터가 사전 로드되지 않습니다. 즉, [`navigator.connection.saveData`](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData)가 `true`입니다.

## data-sveltekit-preload-code

링크에 대해 _data_를 미리 로드하지 않으려는 경우에도 _code_를 미리 로드하는 것이 좋습니다. `data-sveltekit-preload-code` 속성은 '열심함'을 감소시키는 네 가지 값 중 하나를 취할 수 있다는 점을 제외하면 `data-sveltekit-preload-data`와 유사하게 작동합니다.

- `"eager"`는 링크가 바로 미리 로드됨을 의미합니다.
- `"viewport"`는 링크가 뷰포트에 들어가면 미리 로드됨을 의미합니다.
- `"hover"` - 코드만 미리 로드된다는 점을 제외하면 위와 동일
- `"tap"` - 코드만 미리 로드된다는 점을 제외하면 위와 동일

`viewport` 및 `eager`는 탐색 직후 DOM에 있는 링크에만 적용됩니다. 링크가 나중에 추가되면(예를 들어 `{#if ...}` 블록에서) `hover` 또는 `tap`에 의해 트리거될 때까지 미리 로드되지 않습니다. 이는 변경 사항에 대해 DOM을 적극적으로 관찰함으로써 발생하는 성능 저하를 방지하기 위한 것입니다.

> 미리 로드하는 코드는 데이터를 미리 로드하기 위한 전제 조건이므로 이 속성은 존재하는 `data-sveltekit-preload-data` 속성보다 더 열망하는 값을 지정하는 경우에만 효과가 있습니다.

`data-sveltekit-preload-data`와 마찬가지로 사용자가 데이터 사용량 감소를 선택한 경우 이 속성은 무시됩니다.

## data-sveltekit-reload

때때로 우리는 SvelteKit에게 링크를 처리하지 않도록 지시해야 하지만 브라우저가 링크를 처리하도록 허용해야 합니다. 링크에 `data-sveltekit-reload` 속성 추가 중...

```html
<a data-sveltekit-reload href="/path">Path</a>
```

...링크를 클릭하면 전체 페이지 탐색이 발생합니다.

`rel="external"` 속성이 있는 링크는 동일한 처리를 받습니다. 또한 [사전 렌더링](/docs/page-options#prerender) 중에는 무시됩니다.

## data-sveltekit-noscroll

내부 링크로 이동할 때 SvelteKit은 브라우저의 기본 탐색 동작을 미러링합니다. 스크롤 위치를 0,0으로 변경하여 사용자가 페이지의 맨 왼쪽 상단에 있도록 합니다.(링크에 `#hash`가 포함되어 있지 않은 경우 ID가 일치하는 요소로 스크롤됩니다.)

경우에 따라 이 동작을 비활성화할 수 있습니다. 링크에 `data-sveltekit-noscroll` 속성을 추가하는 중...

```html
<a href="path" data-sveltekit-noscroll>Path</a>
```

...링크를 클릭한 후 스크롤을 방지합니다.

## Disabling options

활성화된 요소 내에서 이러한 옵션을 비활성화하려면 `"off"` 값을 사용하십시오.

```html
<div data-sveltekit-preload-data>
	<!-- these links will be preloaded -->
	<a href="/a">a</a>
	<a href="/b">b</a>
	<a href="/c">c</a>

	<div data-sveltekit-preload-data="off">
		<!-- these links will NOT be preloaded -->
		<a href="/d">d</a>
		<a href="/e">e</a>
		<a href="/f">f</a>
	</div>
</div>
```

요소에 속성을 조건부로 적용하려면 다음과 같이 하십시오.

```html
<div data-sveltekit-reload={shouldReload ? '' : 'off'}>
```

> 이것은 HTML에서 `<element attribute>`가 `<element attribute="">`와 동일하기 때문에 작동합니다.
