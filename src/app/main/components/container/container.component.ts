import { Component, OnInit } from '@angular/core';
import { SpotifyApiService } from '../../services/spotify-api.service';
import { TokenRes } from '../../models/spotify-api-model';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
})
export class ContainerComponent implements OnInit {
  constructor(private spotifyApi: SpotifyApiService) {}

  ngOnInit(): void {
    this.getToken();
  }

  getToken() {
    this.spotifyApi.token().subscribe((res: TokenRes) => {
      console.log(res);
    });
  }
}
