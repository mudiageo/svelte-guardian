<script lang="ts">
        import { Button, type ButtonProps } from '$components/ui/button';
        import { UseClipboard } from '$hooks/use-clipboard.svelte';
        import { cn } from '$src/utils';
        import Check from '@lucide/svelte/icons/check';
        import Copy from '@lucide/svelte/icons/copy';
        import X from '@lucide/svelte/icons/x';
        import type { Snippet } from 'svelte';
        import { scale } from 'svelte/transition';

        // omit href so you can't create a link
        interface Props extends Omit<ButtonProps, 'href'> {
                text: string;
                icon?: Snippet<[]>;
                animationDuration?: number;
                onCopy?: (status: UseClipboard['status']) => void;
        }

        let {
                text,
                icon,
                animationDuration = 500,
                variant = 'ghost',
                size = 'icon',
                onCopy,
                class: className,
                ...restProps
        }: Props = $props();

        const clipboard = new UseClipboard();
</script>

<Button
        {...restProps}
        {variant}
        {size}
        class={cn(className)}
        type="button"
        name="copy"
        tabindex={-1}
        onclick={async () => {
                const status = await clipboard.copy(text);

                onCopy?.(status);
        }}
>
        {#if clipboard.status === 'success'}
                <div in:scale={{ duration: animationDuration, start: 0.85 }}>
                        <Check />
                        <span class="sr-only">Copied</span>
                </div>
        {:else if clipboard.status === 'failure'}
                <div in:scale={{ duration: animationDuration, start: 0.85 }}>
                        <X />
                        <span class="sr-only">Failed to copy</span>
                </div>
        {:else}
                <div in:scale={{ duration: animationDuration, start: 0.85 }}>
                        {#if icon}
                                {@render icon()}
                        {:else}
                                <Copy />
                        {/if}
                        <span class="sr-only">Copy</span>
                </div>
        {/if}
</Button>