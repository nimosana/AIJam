/** PlaylistPlayer class
 * @author Nicolas Morales-Sanabria
 * Allows the creation of playlist players, these players allow to load lists of songs,
 * play them in random order without repetition, and loop the lists indefinitely.
 * The playlists can be paused, resumed, restarted, etc. and volumes for each playlist 
 * can be controlled independently.
 * Uses p5.sound to work with .mp3, .wav, .ogg audio files */
if (typeof p5 !== 'undefined') {
    class PlaylistPlayer {

        /** Allows to instance playlist players
         * @param playlistName name for the playlist
         * @param playlist arraylist with the songs
         * every element of the playlist array should contain 3 parameters:
         * sound (mp3,wav,etc.)
         * name (name of the song)
         * artist (author of the song) */
        constructor(playlistName, playlist) {
            //parameters of the playlist
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

        /** initial start for a playlist (or after a stop/reset).
         * Songs in the playlist will play in random order, one after the other,
         * without repeating, playlists will loop indefinitely thanks to playNext() */
        playlistStart() {
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

        /** automatic callback when a song ends (to play the next song of the playlist)
         *  if the playlist is empty (last song plays), restarts it. */
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

        /** pauses a playlist (pauses the sound) */
        playlistPause() {
            if (this.playing) {
                console.log(`${this.playlistName} playlist paused: ${this.currentlyPlaying.name} by ${this.currentlyPlaying.artist}`)
                this.currentlyPlaying.sound.pause();
                this.playing = false;
            }
        }

        /** resumes a paused playlist */
        playlistResume() {
            if (!this.playing) {
                this.playingNext = true;
                this.currentlyPlaying.sound.setVolume(this.volume);
                this.currentlyPlaying.sound.play();
                console.log(`${this.playlistName} playlist resumed: ${this.currentlyPlaying.name} by ${this.currentlyPlaying.artist}`)
                this.playing = true;
            }
        }

        /** plays the next song (if the playlist is playing) */
        playlistNext() {
            if (this.playing) {
                console.log(`nextsound`);
                this.currentlyPlaying.sound.stop();
            }
        }

        /** stops and resets the playlist to its initial state (full playlist) */
        playlistStop() {
            if (this.playing) {
                console.log(`stopping/resetting ${this.playlistName} playlist`);
                this.playingNext = false;
                this.playlist = this.fullPlaylist.splice();
                this.currentlyPlaying.sound.stop();
                this.playing = false;
            }
        }

        /** Allows to change volume of a playlist (current + upcoming sounds)
         * @param {*} vol desired volume (betwen 0 & 1) */
        playlistVolume(vol) {
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
    p5.prototype.PlaylistPlayer = PlaylistPlayer;
    console.log(`p5.playlistPlayer ready!`)
} else {
    console.log(`playlistPlayer loading unsuccessful, make sure to add this script AFTER p5 in your .html`);
}