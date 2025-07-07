<script>
    import { page } from '$app/state';
</script>

<div class="container py-8">
    <h1>Page Not Found</h1>
    <p>The documentation page "{page.params.slug}" doesn't exist.</p>
    <a href="/docs">← Back to documentation</a>
</div>