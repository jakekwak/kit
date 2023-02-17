<script>
	import Features from './home/Features.svelte';
	import Hero from './home/Hero.svelte';
	import Showcase from './home/Showcase.svelte';
	import Try from './home/Try.svelte';
	import Deployment from './home/Deployment.svelte';
	import Svelte from './home/Svelte.svelte';
	import Intro from './home/Intro.svelte';
	import './home/common.css';
</script>

<svelte:head>
	<title>SvelteKit • 효율적이고 군더더기 없는 깔끔한 웹 개발</title>

	<meta name="twitter:title" content="SvelteKit" />
	<meta name="twitter:description" content="효율적이고 군더더기 없는 깔끔한 웹 개발" />
	<meta name="description" content="SvelteKit는 공식 Svelte 애플리케이션 프레임워크입니다" />
</svelte:head>

<div class="home">
	<h1 class="visually-hidden">SvelteKit</h1>

	<Hero />
	<Intro />
	<Try />
	<Svelte />
	<Features />
	<Deployment />
	<Showcase />

	<footer>
		<p>
			SvelteKit은 <a target="_blank" rel="noreferrer" href="https://github.com/sveltejs/kit"
			>프리 오픈소스 소프트웨어</a
		>로 MIT 라이선스로 출시되었습니다.
		</p>
	</footer>
</div>

<style>
	footer {
		padding: 1em var(--sk-page-padding-side);
		text-align: center;
		background: var(--sk-back-2);
	}

	footer p {
		max-width: 20em;
		margin: 0 auto;
	}

	footer p a {
		color: inherit;
		text-decoration: underline;
	}

	@media (min-width: 680px) {
		footer p {
			max-width: none;
		}
	}
</style>
