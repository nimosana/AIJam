class PlaylistPlayer {

    constructor(playlistName, playlist) {
        this.playlistName = playlistName;
        this.playlist = playlist;
        this.fullPlaylist = playlist.slice();
        this.playing = false;
        this.currentlyPlaying = null;
        this.playNext = this.playNext.bind(this);
        this.pausePlaylist = this.pausePlaylist.bind(this);
        this.resumePlaylist = this.resumePlaylist.bind(this);
        this.nextSong = this.nextSong.bind(this);
    }

    initiate() {
        if (!this.playing && this.playlist.length > 0) {
            let chosen = Math.floor(Math.random() * this.playlist.length);
            this.currentlyPlaying = this.playlist[chosen]; // Update the currentlyPlaying variable
            this.currentlyPlaying.play();
            this.currentlyPlaying.onended(this.playNext);
            this.playlist.splice(chosen, 1);
            this.playing = true;
        }
    }

    playNext() {
        if (this.playing) {
            if (this.playlist.length > 0) {
                let chosen = Math.floor(Math.random() * this.playlist.length);
                this.playlist[chosen].play();
                this.currentlyPlaying = this.playlist[chosen]; // Update the currentlyPlaying variable
                this.currentlyPlaying.onended(this.playNext);
                this.playlist.splice(chosen, 1);
            } else {
                this.playlist = this.fullPlaylist.slice();

                let chosen = Math.floor(Math.random() * this.playlist.length);
                this.currentlyPlaying = this.playlist[chosen];
                this.currentlyPlaying.play();
                this.currentlyPlaying.onended(this.playNext);
                this.playlist.splice(chosen, 1);
            }
        }
    }

    pausePlaylist() {
        if (this.playing) {
            console.log(this.currentlyPlaying.isPlaying())
            console.log(`paused`)
            this.currentlyPlaying.pause();
            console.log(this.currentlyPlaying.isPlaying())
            this.playing = false;
        }
    }

    resumePlaylist() {
        if (!this.playing) {
            console.log(`resumed`)
            this.currentlyPlaying.play();
            this.playing = true;
        }
    }

    nextSong() {
        if (this.playing) {
            console.log(`forceStop`)
            this.currentlyPlaying.stop();
        }
    }
}