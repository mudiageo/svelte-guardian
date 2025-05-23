 <script lang="ts">
 import * as Breadcrumb from "$components/ui/breadcrumb/index.js";
  let { path } = $props();
	
const segments = $derived(path
		.split('/')
		.filter(Boolean)
		.map((segment, index, array) => ({
			label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
			href: '/' + array.slice(0, index + 1).join('/')
		})));
 
</script>
 
<Breadcrumb.Root>
 <Breadcrumb.List>
  {#each segments as {href, label}}
 {#if segments[0].href !== href} <Breadcrumb.Separator />{/if}
  <Breadcrumb.Item>
    {#if segments[segments.length-1].href === href}
   <Breadcrumb.Page>{label}</Breadcrumb.Page>
    {:else}
   <Breadcrumb.Link {href}>{label}</Breadcrumb.Link>
   {/if}
  </Breadcrumb.Item>
  {/each}
 </Breadcrumb.List>
</Breadcrumb.Root>
 