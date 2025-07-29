document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("bg-audio");
    const playToggle = document.getElementById("play-toggle");

    let isPlaying = false;
    let initialized = false;
    let currentTrackKey = null; // stores the last loaded key

    async function playSongFromKey(key) {
        console.log("Now playing:", key);
        try {
            const response = await fetch(`https://qobuz.prigoana.com/search/${encodeURIComponent(key)}`);
            if (!response.ok) throw new Error("Track fetch failed");

            const data = await response.json();
            if (!data.url) throw new Error("No URL in response");

            audio.src = data.url;
            audio.load();
            audio.oncanplaythrough = () => {
                audio.play().catch(err => console.error("Audio play error:", err));
                // Update Media Session playback state
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = 'playing';
                }
            };
            currentTrackKey = key;
        } catch (err) {
            console.error("Error loading track:", err);
        }
    }

    playToggle.addEventListener("click", () => {
        if (typeof lastTrackKey === "undefined" || !lastTrackKey) {
            console.error("lastTrackKey is not defined or empty");
            return;
        }

        if (!initialized) {
            audio.muted = false;
            playSongFromKey(lastTrackKey);
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
                    playSongFromKey(lastTrackKey);
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
        // Auto-replay the current lastTrackKey track on end
        playSongFromKey(lastTrackKey);
    });

    // Optional: Sync play/pause events on audio element with mediaSession
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
});
