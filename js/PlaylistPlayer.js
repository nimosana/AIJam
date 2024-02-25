class PlaylistPlayer {

    constructor(playlistName, playlist) {
        this.playlistName = playlistName;
        this.playlist = playlist;
        this.fullPlaylist = playlist.slice();
        this.playing = false;
        console.log(`full length: ${this.fullPlaylist.length}`);
        this.playNext = this.playNext.bind(this);
    }

    initiate() {
        if (!this.playing && this.playlist.length > 0) {
            let chosen = Math.floor(Math.random() * this.playlist.length);
            console.log(`length: ${this.playlist.length}`);
            console.log(`chosen: ${chosen}`);
            this.playlist[chosen].play();
            this.playlist[chosen].onended(this.playNext);
            this.playlist.splice(chosen, 1);
            this.playing = true;
        }
    }

    playNext() {
        if (this.playlist.length > 0) {
            let chosen = Math.floor(Math.random() * this.playlist.length);
            this.playlist[chosen].play();
            console.log(`length: ${this.playlist.length}`);
            console.log(`chosen: ${chosen}`);
            this.playlist[chosen].onended(this.playNext);
            this.playlist.splice(chosen, 1);
        } else {
            this.playlist = this.fullPlaylist.slice();
            console.log(`reset length: ${this.fullPlaylist.length}`);
            console.log(`after reset length: ${this.playlist.length}`);
            let chosen = Math.floor(Math.random() * this.playlist.length);
            this.playlist[chosen].play();
            this.playlist[chosen].onended(this.playNext);
            this.playlist.splice(chosen, 1);
        }
    }
}