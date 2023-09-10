import { Component, OnInit } from '@angular/core';
import { SpotifyApiService } from '../../services/spotify-api.service';
import { TokenRes } from '../../models/spotify-api-model';
import { Playlist } from '../../models/container-model';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
})
export class ContainerComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  token!: string;
  musicLeaguePlaylist: any[] = [];
  sotd2023Playlist: any[] = [];

  trackName!: string;
  artistNames!: string;
  albumCoverUrl!: string;

  musicLeagueResults!: string;
  sotd2023Results!: string;

  displayResults = false;

  // autocomplete
  options: any[] = [];
  filteredOptions!: Observable<any[]>;

  get playlist() {
    return this.form.get('playlist');
  }

  constructor(private spotifyApi: SpotifyApiService) {}

  ngOnInit(): void {
    this.createForm();
    this.getToken();

    // autocomplete
    // this.filteredOptions = this.form.controls['track'].valueChanges.pipe(
    //   startWith(''),
    //   map((value) => {
    //     const name = typeof value === 'string' ? value : value?.name;
    //     return name ? this._filter(name as string) : this.options.slice();
    //   })
    // );
  }

  displayFn(user: any): string {
    return user && user.track.name ? user.track.name : '';
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();

    return this.options.filter((option) =>
      option.track.name.toLowerCase().includes(filterValue)
    );
  }

  private createForm() {
    this.form = new FormGroup({
      track: new FormControl(''),
      playlist: new FormControl('musicLeague'),
    });
  }

  // Get an authorization token for use in future calls.
  private getToken() {
    this.spotifyApi.token().subscribe((res: TokenRes) => {
      this.spotifyApi.updateToken(res.access_token);

      // Get tracks for Music League playlist.
      this.getPlaylistTracks(
        'https://api.spotify.com/v1/playlists/6eF55AYQSMIePtbhAd3fP8/tracks',
        Playlist.MusicLeague
      );

      // Get tracks for SOTD2023 playlist.
      this.getPlaylistTracks(
        'https://api.spotify.com/v1/playlists/6j6NSEbOSGqoekoXF2zMXw/tracks',
        Playlist.SOTD2023
      );
    });
  }

  // Get tracks from a given playlist. The tracks endpoint can only return 100 tracks, if there are more than 100 tracks in a playlist the
  // response will include the url for the next 100 (or however many remaining) tracks in the list. This method will call itself again if
  // needed to continue adding tracks to the list. For example if a playlist has 270 songs, it will call the endpoint and get the first 100
  // songs and add it to the list, then call the returned url to get the next 100 songs and add it to the list, then call the returned url
  // to get the remaining 70 songs and add it to the list. At this point there will be no returned url in the response and the list is complete.
  private getPlaylistTracks(url: string, playlist: number) {
    this.spotifyApi.tracks(url).subscribe((res) => {
      res.items.forEach((item: any) => {
        // Currently there is only the Music League and SOTD2023 playlists. Check to add songs to correct list.
        if (playlist === Playlist.MusicLeague) {
          this.musicLeaguePlaylist.push(item);
        } else {
          this.sotd2023Playlist.push(item);
        }
      });
      // Call endpoint again with the returned url if there is more left of the playlist.
      if (res.next) {
        this.getPlaylistTracks(res.next, playlist);
      }
      if (!res.next && playlist === Playlist.MusicLeague) {
        // Music league playlist is complete
        this.options = this.musicLeaguePlaylist;

        this.filteredOptions = this.form.controls['track'].valueChanges.pipe(
          startWith(''),
          map((value) => {
            const name = typeof value === 'string' ? value : value?.name;
            return name ? this._filter(name as string) : this.options.slice();
          })
        );
      }
    });
  }

  // This method is called when the user selects a song from the list.
  songSelected() {
    console.log('selected song: ', this.form.controls['track'].value);

    this.trackName = this.form.controls['track'].value.track.name;
    this.artistNames = this.getArtists(
      this.form.controls['track'].value.track.artists
    );
    this.albumCoverUrl =
      this.form.controls['track'].value.track.album.images[1].url;
  }

  // getTrack() {
  //   // TODO find a cleaner way to handle this.
  //   this.displayResults = false; // Hide previous results at the start of new search.
  //   let userInput = this.form.controls['track'].value;
  //   if (userInput.includes('?')) {
  //     userInput = userInput.split('?')[0];
  //   }
  //   // The following line allows the user to input the full Spotify link or just the track id.
  //   const trackId = userInput.includes('/')
  //     ? userInput.split('/').pop()
  //     : userInput;

  //   // Handle extra query parameters

  //   this.spotifyApi.specificTrack(trackId).subscribe((res) => {
  //     this.trackName = res.name;
  //     this.artistNames = this.getArtists(res.artists);
  //     this.albumCoverUrl = res.album.images[1].url;
  //     this.checkDuplicates(trackId);
  //     this.form.controls['track'].setValue(''); // Clear input field after doing a search.
  //     this.displayResults = true; // Display results when there is a valid response.
  //   });
  // }

  // TODO move to service, add types.
  private getArtists(artists: any[]) {
    let artistString = '';
    artists.forEach((artist) => {
      artistString += artist.name + ', ';
    });
    artistString = artistString.slice(0, -2);
    return artistString;
  }

  // private checkDuplicates(trackId: string) {
  //   const musicLeagueMatchIndex = this.musicLeaguePlaylist.findIndex(
  //     (track) => track.track.id === trackId
  //   );
  //   const sotd2323MatchIndex = this.sotd2023Playlist.findIndex(
  //     (track) => track.track.id === trackId
  //   );

  //   if (musicLeagueMatchIndex === -1) {
  //     this.musicLeagueResults = 'This song has not been sent yet.';
  //   } else {
  //     this.musicLeagueResults = `This song was submitted already! Song ${
  //       musicLeagueMatchIndex + 1
  //     } of ${this.musicLeaguePlaylist.length}`;
  //   }

  //   if (sotd2323MatchIndex === -1) {
  //     this.sotd2023Results = 'This song has not been sent yet.';
  //   } else {
  //     this.sotd2023Results = `This song was submitted already! Song ${
  //       sotd2323MatchIndex + 1
  //     } of ${this.sotd2023Playlist.length}`;
  //   }
  // }

  changePlaylist() {
    // Clear previous results.
    this.trackName = '';
    this.artistNames = '';
    this.albumCoverUrl = '';

    console.log('selected value: ', this.form.controls['playlist'].value);
    if (this.form.controls['playlist'].value === 'musicLeague') {
      console.log('musicLeague');
      this.options = this.musicLeaguePlaylist;
      // Add this line so the list gets updated properly when clicking the radio buttons.
      this.form.controls['track'].setValue('');
    } else {
      console.log('SOTD2023');
      this.options = this.sotd2023Playlist;
      // Add this line so the list gets updated properly when clicking the radio buttons.
      this.form.controls['track'].setValue('');
    }
  }
}
