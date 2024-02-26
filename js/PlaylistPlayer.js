class PlaylistPlayer {

    constructor(playlistName, playlist) {
        this.playlistName = playlistName;
        this.fullPlaylist = playlist.slice();
        this.playlist = playlist;
        this.volume = 1;
        this.playing = false;
        this.playingNext = true;
        this.currentlyPlaying = null;
        //binding
        this.playNext = this.playNext.bind(this);
    }

    startPlaylist() {
        if (!this.playing) {
            console.log(`starting: ${this.playlistName} playlist`)
            if (this.playlist.length === 0) {
                this.playlist = this.fullPlaylist.slice();
            }
            let chosen = Math.floor(Math.random() * this.playlist.length);
            this.currentlyPlaying = this.playlist[chosen];
            this.currentlyPlaying.sound.setVolume(this.volume);
            this.currentlyPlaying.sound.play();
            console.log(`${this.playlistName} playlist playing: ${this.currentlyPlaying.name} by ${this.currentlyPlaying.artist}`)
            this.currentlyPlaying.sound.onended(this.playNext);
            this.playlist.splice(chosen, 1);
            this.playing = true;
        }
    }

    playNext() {
        if (this.playing) {
            if (this.playlist.length === 0) {
                this.playlist = this.fullPlaylist.slice();
            }
            let chosen = Math.floor(Math.random() * this.playlist.length);
            this.currentlyPlaying = this.playlist[chosen];
            this.currentlyPlaying.sound.setVolume(this.volume);
            this.currentlyPlaying.sound.play();
            this.currentlyPlaying = this.playlist[chosen];
            console.log(`${this.playlistName} playlist playing: ${this.currentlyPlaying.name} by ${this.currentlyPlaying.artist}`)
            this.currentlyPlaying.sound.onended(this.playNext);
            this.playlist.splice(chosen, 1);
        }
    }

    pausePlaylist() {
        if (this.playing) {
            console.log(this.currentlyPlaying.sound.isPlaying())
            console.log(`${this.playlistName} playlist paused: ${this.currentlyPlaying.name} by ${this.currentlyPlaying.artist}`)
            this.currentlyPlaying.sound.pause();
            console.log(this.currentlyPlaying.sound.isPlaying())
            this.playing = false;
        }
    }

    resumePlaylist() {
        if (!this.playing) {
            console.log(`resumed`);
            this.playingNext = true;
            this.currentlyPlaying.sound.setVolume(this.volume);
            this.currentlyPlaying.sound.play();
            console.log(`${this.playlistName} playlist resumed: ${this.currentlyPlaying.name} by ${this.currentlyPlaying.artist}`)
            this.playing = true;
        }
    }

    nextSound() {
        if (this.playing) {
            console.log(`nextsound`);
            this.currentlyPlaying.sound.stop();
        }
    }

    stopPlaylist() {
        if (this.playing) {
            console.log(`stopping/resetting ${this.playlistName} playlist`);
            this.playingNext = false;
            this.playlist = this.fullPlaylist.splice();
            this.currentlyPlaying.sound.stop();
            this.playing = false;
        }
    }

    volumePlaylist(vol) {
        if (typeof vol === 'number') {
            if (this.playing) {
                vol = parseFloat(constrain(vol, 0, 1).toFixed(2));
                this.currentlyPlaying.sound.setVolume(vol);
            }
            this.volume = vol;
            console.log(`${this.playlistName} playlist volume: ${this.volume}`);
        } else {
            console.log(`${this.playlistName} playlist volume error: not a number`);
        }
    }
}