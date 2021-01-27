<script>
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";
  import ElectionItems from "./ElectionItems.svelte";

  export let item;
  export let displayOptions;

  let hideTitle = displayOptions.hideTitle;
  let sumSeats = getSumSeats(item);
  let displayTrendClass = getDisplayTrendClass(item, sumSeats);
  let enhancedParties = getEnhancedParties(item, sumSeats);
  let notElectedParties = enhancedParties.filter(
    party => party.seats !== undefined && party.seats === 0
  );
  let notElectedPartyBunches = getNotElectedPartyBunches(notElectedParties);
  let electedPartyBunches = getElectedPartyBunches(
    enhancedParties,
    notElectedParties
  );
  let hideUpdatedDate = item.options && item.options.hideUpdatedDate;

  function getSumSeats(item) {
    return item.parties
      .map(party => party.seats || 0)
      .reduce((sum, partySeats) => {
        return sum + partySeats;
      }, 0);
  }

  function getDisplayTrendClass(item, sumSeats) {
    let partiesWithPrevious = item.parties.filter(party => {
      return party.previous !== undefined;
    });
    if (sumSeats > 0 && partiesWithPrevious.length > 0) {
      return "q-election-seats-display-trend";
    }
    return "";
  }

  function getEnhancedParties(item, sumSeats) {
    // add party object for vacant seats if total available seats
    // is bigger than sum of all parties' seats
    let vacantSeats = item.totalSeats - sumSeats;
    if (vacantSeats > 0) {
      item.parties.push({
        name: "vakant",
        color: {
          classAttribute: "s-color-gray-4"
        },
        seats: vacantSeats
      });
    }

    item.parties.forEach(party => {
      // define color of each party's arc either via class attribute or color code
      let colorStyle = "";
      let colorClass = "";
      if (party.color) {
        if (party.color.classAttribute) {
          colorClass = party.color.classAttribute;
        } else {
          colorStyle = "background-color: " + party.color.colorCode + ";";
        }
      }
      party.colorClass = colorClass;
      party.colorStyle = colorStyle;

      // calculate trend and degree of trend arrow
      if (party.seats !== undefined) {
        party.hasSeats = true;
        if (party.previous !== undefined) {
          party.hasPrevious = true;
          party.trend = party.seats - party.previous;
        } else {
          party.hasPrevious = false;
          party.trend = party.seats;
        }

        // max amplitude of the trend arrow is 90° plus or minus
        // this correlates to gaining or loosing 5% of total available seats
        let maxAmp = (item.totalSeats * 5) / 100;
        let trendDegree =
          (Math.min(Math.abs(party.trend), maxAmp) * 90) / maxAmp;
        if (party.trend > 0) {
          trendDegree = -trendDegree;
        }
        party.trendDegree = trendDegree;
      } else {
        party.hasSeats = false;
      }

      // parties which are summarized under "others" or vacancies will not have a trend
      let vacantPattern = /(.*(V|v)akant.*)/;
      party.isVacant = vacantPattern.test(party.name);
    });
    return item.parties;
  }

  function getNotElectedPartyBunches(notElectedParties) {
    // split party array into two halfs and create another array out of it
    // in order to make a two columned legend if width is sufficient
    if (notElectedParties !== undefined && notElectedParties.length > 0) {
      let half = Math.ceil(notElectedParties.length / 2);
      let partiesFirstHalf = notElectedParties.slice(0, half);
      let partiesSecondHalf = notElectedParties.slice(half);
      notElectedParties = [partiesFirstHalf, partiesSecondHalf];
    }
    return notElectedParties;
  }

  function getElectedPartyBunches(enhancedParties, notElectedParties) {
    // filter all parties which have one or more seats
    let elected = enhancedParties;
    if (notElectedParties !== undefined && notElectedParties.length > 0) {
      elected = enhancedParties.filter(party => {
        return notElectedParties.indexOf(party) < 0;
      });
    }

    let half = Math.ceil(elected.length / 2);
    let partiesFirstHalf = elected.slice(0, half);
    let partiesSecondHalf = elected.slice(half);
    elected = [partiesFirstHalf, partiesSecondHalf];
    return elected;
  }
</script>

<div class="s-q-item q-election-seats" style="opacity: 0;">
  <Header title={item.title} {hideTitle} subtitle={item.subtitle} />
  <div
    id="q-election-seats-svg-container"
    class="q-election-seats-svg-container" />
  <div class="q-election-seats-total s-font-note">
    <span class="s-font-note--tabularnums">{item.totalSeats}</span> Sitze
  </div>
  <div class="q-election-seats-text-container">
    <div class="q-election-seats-legend">
      {#each electedPartyBunches as electedPartyBunch}
        <ElectionItems parties={electedPartyBunch} {displayTrendClass} />
      {/each}
      {#if notElectedPartyBunches.length > 0}
        <div class="q-election-seats-separator s-color-gray-4" />
        {#each notElectedPartyBunches as notElectedPartyBunch}
          <ElectionItems parties={notElectedPartyBunch} {displayTrendClass} />
        {/each}
      {/if}
    </div>
    <Footer
      notes={item.notes}
      sources={item.sources}
      updatedDate={item.updatedDate}
      {hideUpdatedDate} />
  </div>
</div>
