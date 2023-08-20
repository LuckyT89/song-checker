import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenRes } from '../models/spotify-api-model';

@Injectable({
  providedIn: 'root',
})
export class SpotifyApiService {
  tokenValue!: string;

  constructor(private http: HttpClient) {}

  // Call the token endpoint to get a token used in all other requests.
  token(): Observable<TokenRes> {
    const client_id = 'e803c1c0da68407993988e017835254c';
    const client_secret = 'c2f4352d93d24ec092b26c40d4add2ae';
    // Create a base64 encoded string that includes the client_id and client_secret
    const authorizationValue = 'Basic ' + btoa(client_id + ':' + client_secret);

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', authorizationValue);

    return this.http.post<TokenRes>(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: headers,
      }
    );
  }

  updateToken(token: string) {
    this.tokenValue = token;
  }

  tracks(url: string): Observable<any> {
    const authorizationValue = `Bearer ${this.tokenValue}`;

    const headers = new HttpHeaders().set('Authorization', authorizationValue);

    return this.http.get<any>(url, {
      headers: headers,
    });
  }
}
