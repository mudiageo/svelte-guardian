<script lang="ts">
	import * as Select from '$components/ui/select';

	let { versions = ['1.0.0', '0.9.0', '0.8.0'] } = $props();
	let currentVersion = $state(versions[0]);

	function handleVersionChange(version: string) {
		currentVersion = version;
		// Here you would typically handle version changes,
		// such as updating the documentation content
	}
</script>

<Select.Root value={currentVersion} onValueChange={handleVersionChange}>
	<Select.Trigger class="w-[180px]">
		Select version
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each versions as version}
				<Select.Item value={version}>v{version}</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>