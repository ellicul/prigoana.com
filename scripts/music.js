document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("bg-audio");
    const playToggle = document.getElementById("play-toggle");

    let isPlaying = false;
    let initialized = false;
    let currentTrackKey = null; // stores the last loaded key

    // Play song by key - fetch URL & play
    async function playSongFromKey(key) {
        console.log("Now playing:", key);
        try {
            const response = await fetch(`https://qobuz.prigoana.com/search/${encodeURIComponent(key)}/quality/5`);
            if (!response.ok) throw new Error("Track fetch failed");

            const data = await response.json();
            if (!data.url) throw new Error("No URL in response");

            audio.src = data.url;
            audio.load();
            audio.oncanplaythrough = () => {
                audio.play().catch(err => console.error("Audio play error:", err));
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = 'playing';
                    updateMediaSessionMetadataFromCurrentTrack();
                }
            };
            currentTrackKey = key;
        } catch (err) {
            console.error("Error loading track:", err);
        }
    }

    // Update media session position state (duration, position, playbackRate)
    function updatePositionState() {
        if ('setPositionState' in navigator.mediaSession) {
            navigator.mediaSession.setPositionState({
                duration: audio.duration || 0,
                playbackRate: audio.playbackRate || 1,
                position: audio.currentTime || 0
            });
        }
    }

    // Update media session metadata from the current global track info
    function updateMediaSessionMetadataFromCurrentTrack() {
        if (!('mediaSession' in navigator)) return;
        const track = window.currentTrackInfo;
        if (!track) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.name,
            artist: track.artist,
            album: track.album,
            artwork: track.image ? [
                { src: track.image, sizes: '300x300', type: 'image/png' }
            ] : []
        });
    }

    // Fetch the newest track info from last.fm and play it, updating metadata
    async function fetchAndPlayLatestTrack() {
        try {
            const response = await fetch("https://lastplayed.prigoana.com/eduardprigoana/");
            if (!response.ok) throw new Error("Failed to fetch now playing track");
            
            const data = await response.json();
            const track = data.track;
            const trackKey = [...track.artist["#text"].split(' '), ...track.name.split(' ')].join('+');
            if (!trackKey) throw new Error("No valid track key from data");
            
            // Update globals
            window.lastTrackKey = trackKey;
            window.currentTrackInfo = {
                name: track.name,
                artist: track.artist["#text"],
                album: track.album["#text"],
                image: track.image.find(img => img.size === "extralarge")?.["#text"] || "",
                url: track.url
            };
            
            // Update media session metadata
            updateMediaSessionMetadataFromCurrentTrack();
            
            // Play the track
            await playSongFromKey(trackKey);
        } catch (err) {
            console.error("Error fetching and playing latest track:", err);
            // fallback: replay last known track
            if (window.lastTrackKey) {
                await playSongFromKey(window.lastTrackKey);
                updateMediaSessionMetadataFromCurrentTrack();
            }
        }
    }

    // Handlers for media session actions
    function setupMediaSessionHandlers() {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.setActionHandler('play', () => {
            audio.play().catch(err => console.error("Audio play error:", err));
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            audio.pause();
        });

        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.fastSeek && 'fastSeek' in audio) {
                audio.fastSeek(details.seekTime);
            } else {
                audio.currentTime = details.seekTime;
            }
        });

        navigator.mediaSession.setActionHandler('stop', () => {
            audio.pause();
            audio.currentTime = 0;
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'none';
            }
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            // Implement if you have a playlist
            console.log("Previous track pressed - not implemented");
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            // Play the newest track again
            fetchAndPlayLatestTrack();
        });
    }

    playToggle.addEventListener("click", () => {
        if (typeof lastTrackKey === "undefined" || !lastTrackKey) {
            console.error("lastTrackKey is not defined or empty");
            return;
        }

        if (!initialized) {
            audio.muted = false;
            fetchAndPlayLatestTrack();
            initialized = true;
            isPlaying = true;
            playToggle.textContent = "Pause";

            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
        } else {
            if (isPlaying) {
                audio.pause();
                playToggle.textContent = "Play";
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = 'paused';
                }
            } else {
                // Check if lastTrackKey has changed
                if (lastTrackKey !== currentTrackKey) {
                    fetchAndPlayLatestTrack();
                } else {
                    audio.play().catch(err => console.error("Audio resume error:", err));
                }
                playToggle.textContent = "Pause";
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = 'playing';
                }
            }
            isPlaying = !isPlaying;
        }
    });

    audio.addEventListener("ended", () => {
        fetchAndPlayLatestTrack();
    });

    audio.addEventListener("play", () => {
        isPlaying = true;
        playToggle.textContent = "Pause";
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
        }
    });

    audio.addEventListener("pause", () => {
        isPlaying = false;
        playToggle.textContent = "Play";
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
    });

    // Periodically update position state for scrubbing UI
    setInterval(() => {
        if (isPlaying) {
            updatePositionState();
        }
    }, 500);

    setupMediaSessionHandlers();
});
