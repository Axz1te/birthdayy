const STORAGE_KEY = 'stardewAudioState';

const getUiAudioContext = () => {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return null;

    if (!window.heartButtonAudioContext) {
        window.heartButtonAudioContext = new AudioContextConstructor();
    }

    return window.heartButtonAudioContext;
};

const playHeartButtonSound = async () => {
    const ctx = getUiAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
        try {
            await ctx.resume();
        } catch (err) {
            return;
        }
    }

    const startTime = ctx.currentTime + 0.01;

    const osc = ctx.createOscillator();
    const oscTwo = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    oscTwo.type = 'triangle';

    osc.frequency.setValueAtTime(660, startTime);
    oscTwo.frequency.setValueAtTime(990, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.055, startTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, startTime + 0.09);

    osc.connect(gain).connect(ctx.destination);
    oscTwo.connect(gain);

    osc.start(startTime);
    oscTwo.start(startTime);
    osc.stop(startTime + 0.09);
    oscTwo.stop(startTime + 0.09);
};

const tracks = [
    { title: 'Kay ganda mo', file: 'audio/Kay ganda mo.mp3' },
    { title: 'Pwede Ka Ba', file: 'audio/Pwede Ka Ba.mp3' },
    { title: 'Cinderella', file: 'audio/Cinderella.mp3' },
    { title: 'Pahingi Ako ng Kiss', file: 'audio/Pahingi Ako ng Kiss.mp3' },
    { title: 'Hayop Ka Crush', file: 'audio/Hayop Ka Crush.mp3' },
    { title: 'Minamahal', file: 'audio/Minamahal.mp3' },
    { title: 'Balang Araw', file: 'audio/Balang Araw.mp3' },
    { title: 'Kailangan Mo Ba Ang Puso Ko', file: 'audio/Kailangan Mo Ba Ang Puso Ko.mp3' },
    { title: 'Maisayaw', file: 'audio/Maisayaw.mp3' }
];

const audio = new Audio();
audio.preload = 'metadata';
audio.volume = 0.7;
let currentTrackIndex = 0;
let isPlaying = false;
let savedState = null;

const formatTrackTitle = (title) => title;

const updateTrackDisplay = (title) => {
    const titleEl = document.querySelector('.stardew-audio-title');
    const statusEl = document.querySelector('.stardew-audio-status');

    if (titleEl) {
        titleEl.textContent = formatTrackTitle(title);
    }
    if (statusEl) {
        statusEl.textContent = isPlaying ? 'playing' : 'paused';
    }
};

const updateTrackList = () => {
    const list = document.querySelector('.stardew-track-list');
    if (!list) return;

    list.innerHTML = tracks
        .map((track, index) => {
            const activeClass = index === currentTrackIndex ? 'active' : '';
            return `<div class="track-item ${activeClass}" data-index="${index}">${track.title}</div>`;
        })
        .join('');
};

const saveState = () => {
    const trackList = document.querySelector('.stardew-track-list');
    const listOpen = trackList ? !trackList.classList.contains('collapsed') : false;

    const state = {
        currentTrackIndex,
        currentTime: audio.currentTime || 0,
        savedAt: Date.now(),
        volume: audio.volume,
        isPlaying,
        listOpen
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const loadSavedState = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
        return null;
    }
};

const loadTrack = (index) => {
    if (index < 0) index = tracks.length - 1;
    if (index >= tracks.length) index = 0;
    currentTrackIndex = index;

    audio.src = tracks[currentTrackIndex].file;
    audio.load();
    updateTrackDisplay(tracks[currentTrackIndex].title);
    updateTrackList();
};

const playAudio = async () => {
    try {
        await audio.play();
        isPlaying = true;
        document.querySelector('.stardew-play-button').textContent = '❚❚';
        updateTrackDisplay(tracks[currentTrackIndex].title);
        saveState();
    } catch (err) {
        const statusEl = document.querySelector('.stardew-audio-status');
        if (statusEl) {
            statusEl.textContent = 'tap play again';
        }
    }
};

const pauseAudio = () => {
    audio.pause();
    isPlaying = false;
    document.querySelector('.stardew-play-button').textContent = '▶';
    updateTrackDisplay(tracks[currentTrackIndex].title);
    saveState();
};

const stopAudio = () => {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    document.querySelector('.stardew-play-button').textContent = '▶';
    updateTrackDisplay(tracks[currentTrackIndex].title);
    saveState();
};

const nextTrack = () => {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        playAudio();
    }
};

const setVolume = (value) => {
    audio.volume = Number(value);
    saveState();
};

const attachHeartButtonSound = () => {
    const heartButtons = document.querySelectorAll('.heart-button');

    heartButtons.forEach((button) => {
        button.addEventListener('click', () => {
            playHeartButtonSound();
        });
    });
};

const attachPlayerEvents = () => {
    const playButton = document.querySelector('.stardew-play-button');
    const nextButton = document.querySelector('.stardew-next-button');
    const stopButton = document.querySelector('.stardew-stop-button');
    const volumeSlider = document.querySelector('#stardew-volume');
    const trackList = document.querySelector('.stardew-track-list');
    const listToggle = document.querySelector('.stardew-list-toggle');

    if (playButton) {
        playButton.addEventListener('click', () => {
            if (isPlaying) {
                pauseAudio();
            } else {
                playAudio();
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            nextTrack();
            if (isPlaying) {
                playAudio();
            }
        });
    }

    if (stopButton) {
        stopButton.addEventListener('click', stopAudio);
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (event) => {
            setVolume(event.target.value);
        });
    }

    if (listToggle && trackList) {
        listToggle.addEventListener('click', () => {
            const isOpen = trackList.classList.toggle('collapsed') === false;
            listToggle.setAttribute('aria-expanded', isOpen.toString());
            listToggle.textContent = isOpen ? 'CLOSE' : 'LIST';
            saveState();
        });
    }

    if (trackList) {
        trackList.addEventListener('click', (event) => {
            const item = event.target.closest('.track-item');
            if (!item) return;
            const index = Number(item.dataset.index);
            loadTrack(index);
            playAudio();
        });
    }

    audio.addEventListener('ended', nextTrack);
    audio.addEventListener('error', () => {
        const statusEl = document.querySelector('.stardew-audio-status');
        if (statusEl) {
            statusEl.textContent = 'file not found';
        }
    });
};

const restoreState = () => {
    savedState = loadSavedState();
    if (!savedState) {
        currentTrackIndex = 0;
        return;
    }

    const safeIndex = Number.isInteger(savedState.currentTrackIndex) && savedState.currentTrackIndex >= 0
        ? savedState.currentTrackIndex
        : 0;

    currentTrackIndex = Math.min(safeIndex, Math.max(tracks.length - 1, 0));
    audio.volume = typeof savedState.volume === 'number' ? savedState.volume : 0.7;
    isPlaying = Boolean(savedState.isPlaying);

    loadTrack(currentTrackIndex);

    audio.addEventListener('loadedmetadata', () => {
        if (typeof savedState.currentTime === 'number') {
            let targetTime = savedState.currentTime;

            if (savedState.isPlaying && typeof savedState.savedAt === 'number') {
                targetTime += (Date.now() - savedState.savedAt) / 1000;
            }

            while (audio.duration && targetTime >= audio.duration) {
                targetTime -= audio.duration;
                currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
                loadTrack(currentTrackIndex);
            }

            audio.currentTime = Math.min(targetTime, audio.duration || targetTime);
        }

        if (savedState.listOpen) {
            const trackList = document.querySelector('.stardew-track-list');
            const listToggle = document.querySelector('.stardew-list-toggle');
            if (trackList && listToggle) {
                trackList.classList.remove('collapsed');
                listToggle.setAttribute('aria-expanded', 'true');
                listToggle.textContent = 'CLOSE';
            }
        }

        if (isPlaying) {
            playAudio();
        }
    }, { once: true });
};

window.addEventListener('DOMContentLoaded', () => {
    restoreState();
    attachPlayerEvents();
    attachHeartButtonSound();
    document.querySelector('#stardew-volume').value = audio.volume.toString();

    if (!savedState) {
        playAudio();
    }
});
