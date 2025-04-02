const Webamp = window.Webamp;
const webamp = new Webamp({
    initialTracks: [
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "Intro"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/01-soulja_boy-intro.flac"
      },
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "Crank That (Soulja Boy)"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/02-soulja_boy-crank_that_(soulja_boy).flac"
      },
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "Sidekick"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/03-soulja_boy-sidekick.flac"
      },
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "Snap and Roll"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/04-soulja_boy-snap_and_roll.flac"
      },
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "Bapes (Feat. Arab)"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/05-soulja_boy-bapes_(feat._arab).flac"
      },
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "Let Me Get Em"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/06-soulja_boy-let_me_get_em.flac"
      },
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "Donk"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/07-soulja_boy-donk.flac"
      },
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "Yahhh"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/08-soulja_boy-yahhh.flac"
      },
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "Pass it to Arab (feat. Arab)"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/09-soulja_boy-pass_it_to_arab_(feat._arab).flac"
      },
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "Soulja Girl (feat I-15)"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/10-soulja_boy-soulja_girl_(feat._i-15).flac"
      },
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "Booty Meat"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/11-soulja_boy-booty_meat.flac"
      },
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "Report Card"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/12-soulja_boy-report_card.flac"
      },
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "She Thirsty"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/13-soulja_boy-she_thirsty.flac"
      },
      {
        "metaData": {
          "artist": "Soulja Boy",
          "title": "Dont Get Mad"
        },
        "url": "https://eduardprigoanaalt.github.io/souljaboytellem/14-soulja_boy-dont_get_mad.flac"
      },
    ],
  initialSkin: {
    url: "./skins/PurpleGlow.wsz",
  },
  availableSkins: [
    {
      url: "./skins/Axon.wsz",
      name: "Axon",
    },
    {
      url: "./skins/m-lo_black.wsz",
      name: "Black",
    },
    {
      url: "./skins/PurpleGlow.wsz",
      name: "Purple Glow",
    },
    {
      url: "./skins/purpleplayer.wsz",
      name: "Purple",
    },
    {
      url: "./skins/TSWNN.wsz",
      name: "TSWNN",
    },
    {
      url: "./skins/Vaporwave.wsz",
      name: "Vaporwave",
    },
  ],
  __butterchurnOptions: {
    importButterchurn: () => Promise.resolve(window.butterchurn),
    getPresets: () => {
      const presets = window.butterchurnPresets.getPresets();
      return Object.keys(presets).map((name) => {
        return {
          name,
          butterchurnPresetObject: presets[name],
        };
      });
    },
    butterchurnOpen: true,
  },
});

// Define the target URL to replace and the Base64 replacement
const targetURL = "https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png";
const blackPixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wQAAwAB/ly9ENkAAAAASUVORK5CYII=";

// Function to replace image sources dynamically
function replaceImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.src === targetURL) {
            img.src = blackPixel;
        }
    });
}

// Observe changes to the DOM and apply replacements dynamically
const observer = new MutationObserver(() => replaceImages());
observer.observe(document.body, { childList: true, subtree: true });

// Initial call to replace images already in the DOM
replaceImages();

webamp.renderWhenReady(document.getElementById("app"));
