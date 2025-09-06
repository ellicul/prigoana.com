document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("bg-audio");
    const nowPlayingEl = document.getElementById("now-playing");
    nowPlayingEl.style.transition = "opacity 0.5s ease-in-out";

    let lastTrackKey = null;
    let lastUts = null;

    let currentAudioTrackKey = null;
    let isPlaying = false;
    let isInitialized = false;
    let currentTrackInfo = {};

    function formatTimeAgo(uts) {
        const playedDate = new Date(uts * 1000);
        const now = new Date();
        const diffMs = now - playedDate;
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const timeStringWithZone = playedDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZoneName: 'short'
        });

        const match = timeStringWithZone.match(/^(\d{2}:\d{2})\s*(\w{2,5})$/);
        const formattedTime = match ? match[1] : playedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const tzAbbr = match ? match[2] : "";

        let timeAgo = `at ${formattedTime} ${tzAbbr}, `;
        if (hours > 0) timeAgo += `${hours} hour${hours > 1 ? 's' : ''}, `;
        if (minutes > 0) timeAgo += `${minutes} minute${minutes > 1 ? 's' : ''}, `;
        timeAgo += `${seconds} second${seconds > 1 ? 's' : ''} ago`;

        return `<p>${timeAgo}</p>`;
    }

    function updateTimer() {
        if (!lastUts) return;
        const timerEl = nowPlayingEl.querySelector(".played-info");
        if (timerEl) {
            timerEl.innerHTML = formatTimeAgo(lastUts);
        }
    }

    async function playSongFromKey(trackKey) {
        if (!trackKey) {
            console.error("playSongFromKey called with no trackKey.");
            return;
        }
        console.log("Attempting to play track:", trackKey);
        try {
            const response = await fetch(`https://qobuz.prigoana.com/search/${encodeURIComponent(trackKey)}/quality/5`);
            if (!response.ok) throw new Error(`Track fetch failed with status: ${response.status}`);
            const data = await response.json();
            if (!data.url) throw new Error("No stream URL found in API response.");

            audio.src = data.url;
            currentAudioTrackKey = trackKey;
            audio.load();
            await audio.play();
            updateMediaSessionMetadata();
        } catch (err) {
            console.error("Error loading or playing track:", err);
        }
    }

    function togglePlayback() {
        if (!isInitialized) {
            audio.muted = false;
            playSongFromKey(lastTrackKey);
            isInitialized = true;
        } else if (isPlaying) {
            audio.pause();
        } else {
            if (lastTrackKey !== currentAudioTrackKey) {
                playSongFromKey(lastTrackKey);
            } else {
                audio.play().catch(err => console.error("Audio resume error:", err));
            }
        }
    }

    function setupMediaSessionHandlers() {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.setActionHandler('play', () => {
            if (lastTrackKey !== currentAudioTrackKey) {
                playSongFromKey(lastTrackKey);
            } else {
                audio.play();
            }
        });
        navigator.mediaSession.setActionHandler('pause', () => audio.pause());
        navigator.mediaSession.setActionHandler('stop', () => {
            audio.pause();
            audio.currentTime = 0;
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.fastSeek && 'fastSeek' in audio) {
              audio.fastSeek(details.seekTime);
              return;
            }
            audio.currentTime = details.seekTime;
        });
        navigator.mediaSession.setActionHandler('nexttrack', fetchAndPlayLatestTrack);
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
                duration: audio.duration || 0,
                playbackRate: audio.playbackRate,
                position: audio.currentTime
            });
        }
    }

    async function fetchAndPlayLatestTrack() {
        await fetchLastFmData(true);
    }

    function fetchLastFmData(forcePlay = false) {
        fetch("https://lastplayed.prigoana.com/eduardprigoana/")
            .then(response => response.json())
            .then(data => {
                const track = data.track;
                const newTrackKey = [...track.artist["#text"].split(' '), ...track.name.split(' ')].join('+');

                if (newTrackKey === lastTrackKey && !forcePlay) return;

                lastTrackKey = newTrackKey;
                lastUts = track.date?.uts;

                currentTrackInfo = {
                    name: track.name,
                    artist: track.artist["#text"],
                    album: track.album["#text"],
                    image: track.image.find(img => img.size === "extralarge")?.["#text"] || "",
                    url: track.url
                };

                if (isPlaying || forcePlay) {
                    playSongFromKey(newTrackKey);
                }

                updateDOM();
            })
            .catch(error => {
                nowPlayingEl.textContent = "Could not load now playing info.";
                console.error("Now playing fetch error:", error);
            });
    }

    function updateDOM() {
        nowPlayingEl.style.opacity = 0;

        const performUpdate = () => {
            const { name, artist, album, image, url } = currentTrackInfo;
            const artistUrl = `https://www.last.fm/music/${encodeURIComponent(artist)}`;
            const albumUrl = `https://www.last.fm/music/${encodeURIComponent(artist)}/${encodeURIComponent(album)}`;
            const playIcon = isPlaying ? "❚❚" : "▶";
            const playTitle = isPlaying ? "Pause this track" : "Play this track";

            nowPlayingEl.innerHTML = `
                <p>
                    <a href="${url}" target="_blank"><strong>${name}</strong></a> by
                    <a href="${artistUrl}" target="_blank"><strong>${artist}</strong></a>
                    <span id="inline-play-button" class="play-icon" title="${playTitle}">${playIcon}</span>
                </p>
                <p>
                    <a href="${albumUrl}" target="_blank"><strong>${album}</strong></a>
                </p>
                ${image ? `<a href="${albumUrl}" target="_blank"><img src="${image}" alt="${name}" style="max-width:235px;"></a>` : ""}
                <div class="played-info">${lastUts ? formatTimeAgo(lastUts) : "<p><em>Now playing</em></p>"}</div>
            `;

            document.getElementById("inline-play-button").addEventListener('click', togglePlayback);
            nowPlayingEl.style.opacity = 1;
        };

        setTimeout(performUpdate, 500);
    }

    audio.addEventListener("play", () => {
        isPlaying = true;
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
        const inlinePlayButton = document.getElementById("inline-play-button");
        if (inlinePlayButton) {
            inlinePlayButton.textContent = "❚❚";
            inlinePlayButton.title = "Pause this track";
        }
    });

    audio.addEventListener("pause", () => {
        isPlaying = false;
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
        const inlinePlayButton = document.getElementById("inline-play-button");
        if (inlinePlayButton) {
            inlinePlayButton.textContent = "▶";
            inlinePlayButton.title = "Play this track";
        }
    });

    audio.addEventListener("ended", fetchAndPlayLatestTrack);
    audio.addEventListener('timeupdate', updatePositionState);

    setupMediaSessionHandlers();
    fetchLastFmData();

    setInterval(updateTimer, 1000);
    setInterval(fetchLastFmData, 10000);
});