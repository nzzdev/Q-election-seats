const fixtureDataDirectory = "../../resources/fixtures/data";

// provide every fixture data file present in ../../resources/fixtures/data
const fixtureData = [
  require(`${fixtureDataDirectory}/results-long-names-vacancy-zero-seats.json`),
  require(`${fixtureDataDirectory}/results-partly-previous.json`),
  require(`${fixtureDataDirectory}/results-color-classes-no-vacancy.json`),
  require(`${fixtureDataDirectory}/no-results-only-previous.json`),
  require(`${fixtureDataDirectory}/show-updated-date.json`),
  require(`${fixtureDataDirectory}/hide-updated-date.json`)
];

module.exports = {
  path: "/fixtures/data",
  method: "GET",
  options: {
    tags: ["api"],
  },
  handler: (request, h) => {
    return fixtureData;
  }
};
