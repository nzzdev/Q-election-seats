<script>
  export let title;
  export let subtitle;
  export let hideTitle;
</script>

{#if hideTitle !== true}
  <h3 class="s-q-item__title">{title}</h3>
{/if}
<div class="s-q-item__subtitle">
  {#if subtitle}{subtitle}{/if}
</div>
