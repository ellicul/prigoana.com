document.addEventListener('DOMContentLoaded', () => {
  const modalData = {
    'shitify': {
      title: 'Spotify',
      thoughts: "Spotify barely pays artists shit and ruined the way many people (including myself) consume music. I recommend you either pay for a better platform like Qobuz or Tidal for streaming, or out-right get it for free by cracking spotify, downloading from soulseek, or ripping from streaming through sites like lucida.su and qqdl.site",
      links: [{
        text: 'Spotify CEO Becomes Richer Than Any Musician in History',
        url: 'https://www.headphonesty.com/2024/12/spotify-ceo-becomes-richer-musician-history/'
      }, {
        text: 'How Spotify Has Ruined Music',
        url: 'https://www.theguardian.com/music/2018/oct/05/10-years-of-spotify-should-we-celebrate-or-despair'
      }]
    },
    'grapheneos': {
      title: 'GrapheneOS',
      thoughts: "GrapheneOS is a private and secure mobile operating system based on android. I wish something like this existed for Apple devices, and that banking apps/etc did not restrict jailbroken iOS devices and custom android roms.",
      links: [{
        text: 'GrapheneOS Official Website',
        url: 'https://grapheneos.org/'
      },
      {
        text: 'Stock Android spies on you',
        url: 'https://www.malwarebytes.com/blog/news/2025/03/android-devices-track-you-before-you-even-sign-in'
      },
      
    ]
    },
    'chrome': {
      title: 'Most browsers suck',
      thoughts: "Most modern web browsers are just chromium reskins, with more useless features, tracking and telemetry. If you want a good browser I'd recommend something like ungoogled chromium, librewolf, tor/mullvad browser.",
      links: [{
        text: 'Chrome(ium) spies on you',
        url: 'https://www.orwell.org/google-chrome-lovingly-spies-on-your-browser-history-and-it-would-like-a-word-with-you/'
      },
      {
        text: 'Ungoogled Chromium',
        url: 'https://ungoogled-software.github.io/'
      },
      {
        text: 'LibreWolf',
        url: 'https://librewolf.net/'
      },
      {
        text: 'Mullvad Browser',
        url: 'https://mullvad.net/en/browser'
      },
      {
        text: 'Tor Browser',
        url: 'https://www.torproject.org/download/'
      },
    ]
    },
    'freespeech': {
      title: 'Free Speech',
      thoughts: "I believe people should be free to say whatever they want, and the only speech that should be restricted is speech that directly causes physical harm. Free speech is a fundamental human right that underpins all other freedoms.",
      links: [{
        text: 'FIRE',
        url: 'https://www.thefire.org/'
      },
      {
        text: 'IFS',
        url: 'https://www.ifs.org/'
      },
      
    ]
    },
        'homebrew': {
      title: 'Homebrew/CFW',
      thoughts: "I believe that when someone purchases a product, they should have full ownership rights over it. This means they should be able to use, modify, repair, or repurpose the product in any way they see fit, without restrictions imposed by manufacturers or third parties. I feel strongly that this principle should apply universally, especially to hardware. Whether it’s a computer, a smartphone, a gaming console, or any other device, the individual who buys it should have complete control over its functionality and maintenance. Ownership, in my view, should not come with hidden limitations, licensing restrictions, or barriers that prevent people from fully exercising their rights over the products they legally own.",
      links: [{
        text: 'cfw.guide',
        url: 'https://cfw.guide/'
      },
      {
        text: 'hacks.guide',
        url: 'https://hacks.guide/'
      },
      {
        text: 'cfwaifu',
        url: 'https://cfwaifu.com/'
      },
      
    ]
    },
        'internetarchive': {
      title: 'Internet Archive',
      thoughts: "I believe that access to knowledge and cultural heritage should be open and unrestricted, and the Internet Archive plays a crucial role in making this principle a reality. Everyone should have the ability to freely explore, preserve, and share the vast wealth of information, books, websites, audio, and video housed in its collections, without artificial barriers or restrictions imposed by corporations or other entities. The Internet Archive empowers individuals to engage with history, research, and creativity on their own terms, ensuring that digital content remains accessible to all. In my view, the mission of the Internet Archive embodies the idea that information, once published, should belong to the public in a meaningful way, free from arbitrary limitations that prevent full access, study, or reuse.",
      links: [{
        text: 'Internet Archive',
        url: 'https://archive.org/'
      },
      {
        text: 'ArchiveTeam',
        url: 'https://archiveteam.org/'
      },
    ]
    },
  };

  const modal = document.getElementById('infoModal');
  const closeModalButton = document.querySelector('.close-button');
  const modalTriggers = document.querySelectorAll('.modal-trigger');
  const modalTitleEl = document.getElementById('modal-title');
  const modalThoughtsEl = document.getElementById('modal-thoughts');
  const modalLinksEl = document.getElementById('modal-links');

  function openModal(id) {
    const data = modalData[id];
    if (!data || !data.title) {
      const trigger = document.querySelector(`[data-modal-id="${id}"]`);
      if (trigger && trigger.href) {
        window.open(trigger.href, '_blank');
      }
      return;
    }
    modalTitleEl.textContent = data.title;
    modalThoughtsEl.textContent = data.thoughts;
    modalLinksEl.innerHTML = '';
    if (data.links && data.links.length > 0) {
      const ul = document.createElement('ul');
      data.links.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.url;
        a.textContent = link.text;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        li.appendChild(a);
        ul.appendChild(li);
      });
      modalLinksEl.appendChild(ul);
    }
    modal.style.display = 'block';
  }

  function closeModal() {
    modal.style.display = 'none';
  }
  modalTriggers.forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const modalId = button.getAttribute('data-modal-id');
      openModal(modalId);
    });
  });
  closeModalButton.addEventListener('click', closeModal);
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
      closeModal();
    }
  });
});