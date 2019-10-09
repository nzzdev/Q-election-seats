<script>
  import * as d3format from 'd3-format';

  const locale = d3format.formatDefaultLocale({
    decimal: ",",
    thousands: " ", // this is a viertelgeviert U+2005
    type: " ",
    minus: "–" // U+2013
  });

  const formatSigned = d3format.format('+~r');

  export let parties;
  export let displayTrendClass;
</script>

<div class="q-election-seats-party-list {displayTrendClass}">
  {#each parties as party}
    <div class="q-election-seats-party-item s-font-note-s">
      <div class="q-election-seats-party-item-info-color {party.colorClass}" style={party.colorStyle} />
      <div class="q-election-seats-party-item-info-name s-font-note">{party.name}</div>
      {#if party.hasSeats}
        <div class="q-election-seats-party-item-seats-number">{party.seats}</div>
        <div class="q-election-seats-party-item-seats-text">Sitz{#if party.seats > 1 || party.seats === 0}e{/if}</div>
        {#if !party.isVacant && party.hasPrevious}
          <div class="q-election-seats-party-item-trend-number">{#if party.trend !== 0}{formatSigned(party.trend)}{/if}</div>
          <div class="q-election-seats-party-item-trend-icon s-color-gray-8">
            <svg
              style="transform: rotate({party.trendDegree}deg);"
              width="14"
              height="14"
              viewBox="0 0 13 13"
              xmlns="http://www.w3.org/2000/svg">
              <g fill="currentColor" fill-rule="evenodd">
                <path
                  d="M11.096 11.096a6.5 6.5 0 1 1-9.192-9.192 6.5 6.5 0 0 1
                  9.192 9.192zm-.707-.707a5.5 5.5 0 1 0-7.778-7.778 5.5 5.5 0 0
                  0 7.778 7.778z" />
                <path d="M7 7H3V6h4V4l4 2.5L7 9V7z" />
              </g>
            </svg>
          </div>
        {:else}
          <div class="q-election-seats-party-item-trend-space" />
        {/if}
      {/if}
    </div>
  {/each}
</div>
