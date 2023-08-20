import { Component, OnInit } from '@angular/core';
import { SpotifyApiService } from '../../services/spotify-api.service';
import { TokenRes } from '../../models/spotify-api-model';
import { Playlist } from '../../models/container-model';
import { FormControl, FormGroup } from '@angular/forms';

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

  constructor(private spotifyApi: SpotifyApiService) {}

  ngOnInit(): void {
    this.createForm();
    this.getToken();
  }

  createForm() {
    this.form = new FormGroup({
      track: new FormControl(''),
    });
  }

  // Get an authorization token for use in future calls.
  getToken() {
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
  getPlaylistTracks(url: string, playlist: number) {
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
    });
  }

  testThing() {
    console.log('this.musicLeaguePlaylist: ', this.musicLeaguePlaylist);
    console.log('this.sotd2023Playlist: ', this.sotd2023Playlist);
  }

  getTrack() {
    const link = this.form.controls['track'].value;
    const trackId = link.split('/').pop();
    console.log('trackId: ', trackId);
  }
}
