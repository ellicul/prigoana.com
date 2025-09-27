(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const fallbackTrackData = {
        key: 'Boards of Canada+Roygbiv',
        info: {
            name: 'Life Of The Party [V33](feat. André 3000)',
            artist: 'Kanye West',
            album: 'DONDA',
            image: './assets/cover.jpg',
            url: 'https://www.last.fm/music/Kanye%20West/_/Life%20Of%20The%20Party%20%5BV33%5D%20(feat.%20Andr%C3%A9%203000)'
        },
        streamUrl: './assets/audio.mp3'
    };

    const audio1 = document.getElementById("bg-audio-1");
    const audio2 = document.getElementById("bg-audio-2");
    const nowPlayingEl = document.getElementById("now-playing");

    let activeAudioEl = audio1;
    let nextAudioEl = audio2;

    let lastTrackKey = null;
    let preloadedTrack = null;
    let lastUts = null;
    let isPlaying = false;
    let isInitialized = false;
    let isFallbackActive = false;
    let currentTrackInfo = {};
    const crossfadeDuration = 2000;
    const transitionDuration = 500;

    function formatTimeAgo(uts) {
        const playedDate = new Date(uts * 1000);
        const now = new Date();
        const timeFormatter = new Intl.DateTimeFormat(undefined, {
            hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short'
        });
        const timeString = timeFormatter.format(playedDate);
        const diffSeconds = Math.floor((now - playedDate) / 1000);
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;
        let timeAgoParts = [];
        if (hours > 0) timeAgoParts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
        if (minutes > 0) timeAgoParts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
        if (seconds >= 0) timeAgoParts.push(`${seconds} second${seconds !== 1 ? 's' : ''} ago`);
        return `<p>at ${timeString}, ${timeAgoParts.join(', ')}</p>`;
    }

    function updateTimer() {
        const timerEl = nowPlayingEl.querySelector(".played-info");
        if (!timerEl || isFallbackActive) return;
        
        const nowPlayingText = "<p><em>Now playing</em></p>";
        if (lastUts === null) {
            if (timerEl.innerHTML !== nowPlayingText) timerEl.innerHTML = nowPlayingText;
        } else {
            timerEl.innerHTML = formatTimeAgo(lastUts);
        }
    }

    async function preloadTrack(trackKey, trackInfo) {
        preloadedTrack = { key: trackKey, info: trackInfo, url: null, preloadedImage: null };
        try {
            const streamResponse = await fetch(`https://qobuz.prigoana.com/search/${encodeURIComponent(trackKey)}/quality/5`);
            if (!streamResponse.ok) throw new Error(`Stream fetch failed: ${streamResponse.status}`);
            const streamData = await streamResponse.json();
            if (!streamData.url) throw new Error("No stream URL in response.");

            const audioReadyPromise = new Promise((resolve, reject) => {
                nextAudioEl.src = streamData.url;
                nextAudioEl.load();
                nextAudioEl.addEventListener('canplaythrough', resolve, { once: true });
                nextAudioEl.addEventListener('error', reject, { once: true });
            });

            const imageReadyPromise = new Promise((resolve) => {
                if (!trackInfo.image) { resolve(null); return; }
                const img = new Image();
                img.src = trackInfo.image;
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
            });

            const [_, preloadedImage] = await Promise.all([audioReadyPromise, imageReadyPromise]);
            preloadedTrack.url = streamData.url;
            preloadedTrack.preloadedImage = preloadedImage;
        } catch (err) {
            console.error("Error preloading track:", err);
            preloadedTrack = null;
            throw err;
        }
    }

    async function loadFallbackTrack(forcePlay = false) {
        if (lastTrackKey === fallbackTrackData.key) {
            return;
        }

        console.log("Loading fallback track.");
        isFallbackActive = true;
        
        try {
            const audioReadyPromise = new Promise((resolve, reject) => {
                nextAudioEl.src = fallbackTrackData.streamUrl;
                nextAudioEl.load();
                nextAudioEl.addEventListener('canplaythrough', resolve, { once: true });
                nextAudioEl.addEventListener('error', reject, { once: true });
            });

            const imageReadyPromise = new Promise((resolve) => {
                if (!fallbackTrackData.info.image) { resolve(null); return; }
                const img = new Image();
                img.src = fallbackTrackData.info.image;
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
            });

            const [_, preloadedImage] = await Promise.all([audioReadyPromise, imageReadyPromise]);
            
            preloadedTrack = {
                key: fallbackTrackData.key,
                info: fallbackTrackData.info,
                url: fallbackTrackData.streamUrl,
                preloadedImage: preloadedImage
            };
            
            lastTrackKey = preloadedTrack.key;
            currentTrackInfo = preloadedTrack.info;
            currentTrackInfo.imageEl = preloadedTrack.preloadedImage;
            lastUts = null;

            if (isPlaying || forcePlay) {
                crossfadeAndSwitch(preloadedTrack);
            } else {
                updateDOM();
            }

        } catch (fallbackError) {
             console.error("Could not even load the fallback track:", fallbackError);
             nowPlayingEl.textContent = "Error loading fallback track. Please check the console.";
        }
    }

    function crossfadeAndSwitch(trackData) {
        const oldAudioEl = activeAudioEl;
        const newAudioEl = nextAudioEl;
        
        lastTrackKey = trackData.key;
        currentTrackInfo = trackData.info;
        currentTrackInfo.imageEl = trackData.preloadedImage;
        updateDOM();
        updateMediaSessionMetadata();

        newAudioEl.volume = 0;
        newAudioEl.play().catch(err => console.error("New audio play error:", err));

        const fade = setInterval(() => {
            const step = 1 / (crossfadeDuration / 20);
            oldAudioEl.volume = Math.max(0, oldAudioEl.volume - step);
            newAudioEl.volume = Math.min(1, newAudioEl.volume + step);

            if (newAudioEl.volume >= 1) {
                clearInterval(fade);
                oldAudioEl.pause();
                oldAudioEl.src = "";
                activeAudioEl = newAudioEl;
                nextAudioEl = oldAudioEl;
            }
        }, 20);
    }

    async function startInitialPlayback(trackData) {
        activeAudioEl.src = trackData.url;
        activeAudioEl.volume = 1;
        updateMediaSessionMetadata();
        await activeAudioEl.play();
    }
    
    function togglePlayback() {
        if (!preloadedTrack) return;

        if (!isInitialized) {
            audio1.muted = false;
            audio2.muted = false;
            startInitialPlayback(preloadedTrack);
            isInitialized = true;
        } else if (isPlaying) {
            activeAudioEl.pause();
        } else {
            if (lastTrackKey !== preloadedTrack.key) {
                 crossfadeAndSwitch(preloadedTrack);
            } else {
                activeAudioEl.play().catch(err => console.error("Audio resume error:", err));
            }
        }
    }

    async function fetchLastFmData(forcePlay = false) {
        try {
            const response = await fetch("https:/lastplayed.prigoana.com/eduardprigoana/");
            if (!response.ok) throw new Error(`API fetch failed: ${response.status}`);
            
            const data = await response.json();
            const track = data.track;
            const newTrackKey = `${track.artist["#text"]} ${track.name}`.replace(/\s+/g, '+');
            
            isFallbackActive = false;

            if (newTrackKey === lastTrackKey) {
                const isNowPlaying = track['@attr']?.nowplaying === 'true';
                lastUts = isNowPlaying ? null : track.date?.uts;
                return;
            }

            const newTrackInfo = {
                name: track.name,
                artist: track.artist["#text"],
                album: track.album["#text"],
                image: track.image.find(img => img.size === "extralarge")?.["#text"] || "",
                url: track.url
            };
            
            lastUts = track.date?.uts || null;
            await preloadTrack(newTrackKey, newTrackInfo);
            
            lastTrackKey = preloadedTrack.key;
            currentTrackInfo = preloadedTrack.info;
            currentTrackInfo.imageEl = preloadedTrack.preloadedImage;

            if (isPlaying || forcePlay) {
                crossfadeAndSwitch(preloadedTrack);
            } else {
                updateDOM();
            }
        } catch (error) {
            console.error("Fetch/Preload error, initiating fallback:", error);
            await loadFallbackTrack(forcePlay);
        }
    }
    
    function updateDOM() {
        const currentHeight = nowPlayingEl.offsetHeight;
        if (currentHeight > 0) {
            nowPlayingEl.style.minHeight = `${currentHeight}px`;
        }
        
        nowPlayingEl.style.opacity = 0;

        setTimeout(() => {
            const { name, artist, album, imageEl, url } = currentTrackInfo;
            const artistUrl = `https://www.last.fm/music/${encodeURIComponent(artist)}`;
            const albumUrl = `https://www.last.fm/music/${encodeURIComponent(artist)}/${encodeURIComponent(album)}`;
            const playIcon = isPlaying ? "❚❚" : "▶";
            const playTitle = isPlaying ? "Pause this track" : "Play this track";
            const imageHtml = imageEl ? `<a href="${albumUrl}" target="_blank" rel="noopener noreferrer"><img src="${imageEl.src}" alt="${name}" style="max-width:235px;"></a>` : "";

            const playedInfoHtml = isFallbackActive 
                ? "<p><em>Favourite track</em></p>" 
                : (lastUts ? formatTimeAgo(lastUts) : "<p><em>Now playing</em></p>");

            nowPlayingEl.innerHTML = `
                <p>
                    <a href="${url}" target="_blank" rel="noopener noreferrer"><strong>${name}</strong></a> by
                    <a href="${artistUrl}" target="_blank" rel="noopener noreferrer"><strong>${artist}</strong></a>
                    <span id="inline-play-button" class="play-icon" title="${playTitle}">${playIcon}</span>
                </p>
                <p>
                    <a href="${albumUrl}" target="_blank" rel="noopener noreferrer"><strong>${album}</strong></a>
                </p>
                ${imageHtml}
                <div class="played-info">${playedInfoHtml}</div>
            `;
            
            document.getElementById("inline-play-button").addEventListener('click', togglePlayback);
            nowPlayingEl.style.opacity = 1;

            setTimeout(() => {
                nowPlayingEl.style.minHeight = '';
            }, transitionDuration);

        }, transitionDuration);
    }
    
    function updatePlayPauseButton() {
        const playButton = document.getElementById("inline-play-button");
        if (!playButton) return;
        playButton.textContent = isPlaying ? "❚❚" : "▶";
        playButton.title = isPlaying ? "Pause this track" : "Play this track";
    }

    function setupMediaSession() {
        if (!('mediaSession' in navigator)) return;
        const actions = [
            ['play', () => activeAudioEl.play()],
            ['pause', () => activeAudioEl.pause()],
            ['stop', () => { activeAudioEl.pause(); activeAudioEl.currentTime = 0; }],
            ['nexttrack', () => fetchLastFmData(true)],
            ['seekto', (details) => { activeAudioEl.currentTime = details.seekTime; }]
        ];
        for (const [action, handler] of actions) {
            try { navigator.mediaSession.setActionHandler(action, handler); } 
            catch (error) { console.warn(`Media session action '${action}' not supported.`); }
        }
    }
    
    function updateMediaSessionMetadata() {
        if (!('mediaSession' in navigator) || !currentTrackInfo.name) return;
        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrackInfo.name,
            artist: currentTrackInfo.artist,
            album: currentTrackInfo.album,
            artwork: currentTrackInfo.image ? [{ src: currentTrackInfo.image, sizes: '300x300', type: 'image/jpeg' }] : []
        });
    }

    function updatePositionState() {
        if ('setPositionState' in navigator.mediaSession) {
            navigator.mediaSession.setPositionState({
                duration: activeAudioEl.duration || 0,
                playbackRate: activeAudioEl.playbackRate,
                position: activeAudioEl.currentTime
            });
        }
    }
    
    const setupAudioEventListeners = (audioEl) => {
        audioEl.addEventListener("play", () => {
            if (audioEl === activeAudioEl) {
                isPlaying = true;
                if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
                updatePlayPauseButton();
            }
        });
        audioEl.addEventListener("pause", () => {
            if (audioEl === activeAudioEl) {
                isPlaying = false;
                if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
                updatePlayPauseButton();
            }
        });
        audioEl.addEventListener("ended", () => {
            if (audioEl === activeAudioEl) {
                fetchLastFmData(true);
            }
        });
        audioEl.addEventListener('timeupdate', () => {
             if (audioEl === activeAudioEl) updatePositionState();
        });
    };

    setupAudioEventListeners(audio1);
    setupAudioEventListeners(audio2);

    setupMediaSession();
    fetchLastFmData();
    setInterval(updateTimer, 1000);
    setInterval(fetchLastFmData, 10000);
  });
})();

