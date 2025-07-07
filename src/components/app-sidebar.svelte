<script lang="ts" module>
	// sample data
	const data = {
		versions: ["0.1.15", "0.3.0-alpha", "0.2.0-beta.1"],
		navigation: [
			{
				title: "Getting Started",
				url: "#",
				items: [
					{
						title: "Installation",
						url: "#",
					},
					{
						title: "Project Structure",
						url: "#",
					},
				],
			},
			{
				title: "Building Your Application",
				url: "#",
				items: [
					{
						title: "Routing",
						url: "#",
					},
					{
						title: "Data Fetching",
						url: "#",
						isActive: true,
					},
					{
						title: "Rendering",
						url: "#",
					},
					{
						title: "Caching",
						url: "#",
					},
					{
						title: "Styling",
						url: "#",
					},
					{
						title: "Optimizing",
						url: "#",
					},
					{
						title: "Configuring",
						url: "#",
					},
					{
						title: "Testing",
						url: "#",
					},
					{
						title: "Authentication",
						url: "#",
					},
					{
						title: "Deploying",
						url: "#",
					},
					{
						title: "Upgrading",
						url: "#",
					},
					{
						title: "Examples",
						url: "#",
					},
				],
			},
			{
				title: "API Reference",
				url: "#",
				items: [
					{
						title: "Components",
						url: "#",
					},
					{
						title: "File Conventions",
						url: "#",
					},
					{
						title: "Functions",
						url: "#",
					},
					{
						title: "next.config.js Options",
						url: "#",
					},
					{
						title: "CLI",
						url: "#",
					},
					{
						title: "Edge Runtime",
						url: "#",
					},
				],
			},
			{
				title: "Architecture",
				url: "#",
				items: [
					{
						title: "Accessibility",
						url: "#",
					},
					{
						title: "Fast Refresh",
						url: "#",
					},
					{
						title: "Next.js Compiler",
						url: "#",
					},
					{
						title: "Supported Browsers",
						url: "#",
					},
					{
						title: "Turbopack",
						url: "#",
					},
				],
			},
			{
				title: "Community",
				url: "#",
				items: [
					{
						title: "Contribution Guide",
						url: "#",
					},
				],
			},
		],
	};
</script>

<script lang="ts">
  import { page } from '$app/state';
	import SearchForm from "./search-form.svelte";
	import VersionSwitcher from "./version-switcher.svelte";
	import * as Collapsible from "$components/ui/collapsible/index.js";
	import * as Sidebar from "$components/ui/sidebar/index.js";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import type { ComponentProps } from "svelte";

	let { ref = $bindable(null), navigation, ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

  let currentPath = $derived(page.url.pathname);
	// Track expanded sections
	let expandedSections: Record<string, boolean> = $state({});

// Initialize expanded state for each navigation section
navigation.forEach((section) => {
  expandedSections[section.title] = false;
});

// Initialize sections as expanded if they contain the current page
$effect(() => {
  navigation.forEach((section) => {
    if (section.items?.some(item => item.url === currentPath)) {
      expandedSections[section.title] = true;
    }
  });
});
</script>

<Sidebar.Root bind:ref {...restProps}>
	<Sidebar.Header>
		<VersionSwitcher versions={data.versions} defaultVersion={data.versions[0]} />
		<SearchForm />
	</Sidebar.Header>
	<Sidebar.Content class="gap-0">
		<!-- We create a collapsible SidebarGroup for each parent. -->
		{#each navigation as item (item.title)}
			<Collapsible.Root title={item.title} bind:open={expandedSections[item.title]} class="group/collapsible">
				<Sidebar.Group>
					<Sidebar.GroupLabel
						class="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
					>
						{#snippet child({ props })}
							<Collapsible.Trigger {...props}>
								{item.title}
								<ChevronRightIcon
									class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
								/>
							</Collapsible.Trigger>
						{/snippet}
					</Sidebar.GroupLabel>
					<Collapsible.Content>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								{#each item.items as subItem (subItem.title)}
									<Sidebar.MenuItem>
										<Sidebar.MenuButton isActive={currentPath === subItem.url} >
											{#snippet child({ props })}
												<a href={subItem.url} {...props}>{subItem.title}</a>
											{/snippet}
										</Sidebar.MenuButton>
									</Sidebar.MenuItem>
								{/each}
							</Sidebar.Menu>
						</Sidebar.GroupContent>
					</Collapsible.Content>
				</Sidebar.Group>
			</Collapsible.Root>
		{/each}
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
