<script>
	import '../app.css';

	let { children } = $props();
</script>

<div class="container">
	{@render children()}
	<footer class="footer">
		Made by <a href="https://github.com/wasita">wasita</a>
	</footer>
</div>
