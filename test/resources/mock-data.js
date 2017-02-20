module.exports = {
  title: "Sitzverteilung Parlament Frankreich",
  sources: [
    {
      "text": "asdjfh",
      "link": {
        "url": "www.nzz.ch",
        "isValid": true
      }
    }
  ],
  subtitle: "Möglichkeit zusätzliche Informationen als Untertitel zu erfassen",
  notes: "Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses getan hätte, wurde er eines Morgens verhaftet.",
  totalSeats: 200,
  parties: [
    {
      name: "Die Union",
      abbreviation: "CDU/CSU",
      color: 
        {
          colorCode: "#0084c7"
        },
      seats: 70,
      previous: 71
    },
    {
      name: "Sozialdemokratische Partei Deutschlands",
      abbreviation: "SPD",
      color: 
        {
          colorCode: "#c31906",
          classAttribute: "s-viz-color-party-sp-5"
        },
      seats: 80,
      previous: 75
    },
    {
      name: "Bündnis 90/Die Grünen",
      abbreviation: "Die Grünen",
      color: 
        {
          colorCode: "#66a622"
        },
      previous: 20,
      seats: 24
    },
    {
      name: "Die Linke",
      abbreviation: "Die Linke",
      color: 
      {
        colorCode: "#a35fd1"
      },
      previous: 10,
      seats: 20
    },
    {
      name: "vakant",
      abbreviation: "vakant",
      color:
      {
        colorCode: "#5c5c5c",
        classAttribute: "s-color-gray-6"
      },
      seats: 1
    }
  ]
}
