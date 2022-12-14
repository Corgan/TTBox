export default {
  ontop: false,
  locked: false,
  blocks: [
    {
      id: "c2s",
      title: "Challenge2s",
      x: 1,
      y: 1,
      w: 43,
      h: 8,
      z: 0,
      collapsed: false,
      type: "Challenge2Block"
    },
    {
      id: "world",
      title: "World",
      x: 1,
      y: 1,
      w: 43,
      h: 8,
      z: 0,
      collapsed: false,
      type: "WorldBlock"
    },
    {
      id: "daily",
      title: "Daily Status",
      x: 1,
      y: 1,
      w: 43,
      h: 8,
      z: 0,
      collapsed: false,
      type: "DailyBlock"
    },
    {
      id: "voids",
      title: "Voids",
      x: 44,
      y: 1,
      w: 30,
      h: 45,
      z: 1,
      collapsed: false,
      type: "VoidsBlock"
    },
    {
      id: "run",
      title: "Current Run",
      x: 1,
      y: 46,
      w: 43,
      h: 25,
      z: 2,
      collapsed: false,
      type: "InfoBlock",
      props: [
        "rtime",
        "zone",
        "ztime",
        "cell",
        "mtime",
        "r-he",
        "vms",
        "fluffxp",
        "scry-left",
        "de-drop",
        "zone-emp",
        "uber-emp",
        "population",
        "breed-time",
        "gator-next",
        "gators",
        "gator-ratio"
      ]
    },
    {
      id: "playerspire",
      title: "Player Spire",
      x: 74,
      y: 1,
      w: 15,
      h: 45,
      z: 3,
      collapsed: false,
      type: "PlayerSpireBlock"
    },
    {
      id: "info",
      title: "Info",
      x: 44,
      y: 46,
      w: 45,
      h: 25,
      z: 4,
      collapsed: false,
      type: "InfoBlock",
      props: [
        "hze",
        "liq",
        "t-he",
        "nu",
        "spent",
        "ss",
        "avail",
        "magmite",
        "c2",
        "bones",
        "achieve",
        "fluffy",
        "de",
        "next-talent"
      ]
    },
    {
      id: "bw",
      title: "Bionics",
      x: 1,
      y: 37,
      w: 11,
      h: 9,
      z: 5,
      collapsed: false,
      type: "BionicMapBlock"
    },
    {
      id: "heirlooms",
      title: "Heirlooms",
      x: 1,
      y: 9,
      w: 23,
      h: 28,
      z: 6,
      collapsed: false,
      type: "HeirloomsBlock"
    },
    {
      id: "test",
      title: "Test",
      x: 12,
      y: 37,
      w: 12,
      h: 9,
      z: 7,
      collapsed: false,
      type: "TextBlock",
      text: "Testing"
    },
    {
      id: "maps",
      title: "Prestige Items",
      x: 24,
      y: 9,
      w: 20,
      h: 37,
      z: 9,
      collapsed: false,
      type: "MapsBlock"
    }
  ]
}