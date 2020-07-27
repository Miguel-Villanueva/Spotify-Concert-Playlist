import React, { Component } from 'react';
import logo from '../logo.svg';
import '../App.css';
import { Input } from 'antd';
import 'antd/dist/antd.css';
import '../styles/playlist.css'
const { Search } = Input;

let Spotify = require('spotify-web-api-js');
let spotifyApi = new Spotify();
spotifyApi.setAccessToken('BQD6ETs3w3Bep1VGnyaeEwB9U4smnFPKFrzghyJeZcKeEqCSaDT89ujbmLnzK4ET-m7X3cdlm8qiEP4rz8VrOnfF6B8z_bHpfr6WWs7T9GqPzrSKcb7BV_6fr5UWp_vBCu83ONZJQgHiMKmY3CtqDhCfml66IJdm8Toqc6v-27D4ZE4V1KjdvVWmLIRl3B40UsW5&refresh_token=AQC8LFBV3Aa3IrqtVrHY7F7nsFvkTxOSJnu9iIBVFpI1m5FIHFEsM8262A-KlCcuChI2swHvW4b-aSzVXVvW0-Pf2fNerNS0csGwoiUHz9uV0p4P3DquwgiFdk-iqJKP3do');

class Playlist extends Component {
  constructor(props) {
    super(props);
    this.state={
      userId: '',
      userPlaylistId: '',
      artist: '',
      artistId: '',
      topTracks: [],
      topTracksIds: [] 
    }
  }

  sliceUserId = (url) => {
      let string = url.split(/[/?]/);
      return string[5]
  }

  getUser = () => {
      spotifyApi.getUserPlaylists().then(
        (data) => {
            this.setState({
                userId: this.sliceUserId(data.href)
            })
            console.log(this.state.userId)
            this.createPlaylist();

        },
        (err) => {
        console.error(err);
        }
    );
  }

  searchArtist = (artist) => {
    spotifyApi.searchArtists(artist).then(
        (data) => {
            if(data !== undefined) {
                let artistName = data.artists.items[0].name
                let id = data.artists.items[0].id
                this.setState({
                    artist: artistName, // index is 0 because most popular query's index is 0 
                    artistId: id // index is 0 because most popular query's index is 0 
                })
            }
            this.getTopTracks(this.state.artistId, 'TR');
        },
        (err) => {
            console.log(err)
        }
    );
  }

  getTopTracks = (artistId, country) => {
      spotifyApi.getArtistTopTracks(artistId, country).then(
          (data) => {
            this.setState({
                topTracks: data.tracks, // track info
            })
            
            this.state.topTracks.map((track) => {
                this.setState({
                    topTracksIds:this.state.topTracksIds.concat(track.uri) //storing track id's in an array
                })
            })
            this.getUser();
          },
          (err) => {
              console.log(err)
          }
      )
  }

  createPlaylist = () => {
      spotifyApi.createPlaylist(this.state.userId, {name: 'playlistApp_000001', description: 'created with playlistApp'}).then(
          (data) => {
              this.setState({
                  userPlaylistId: data.id
              })
              this.addTracksToPlaylist();
          },
          (err) => {
              console.log(err)
          }
      )
  }

  addTracksToPlaylist = () => {
      spotifyApi.addTracksToPlaylist(this.state.userPlaylistId, this.state.topTracksIds).then(
          (data) => {
              console.log(data)
          },
          (err) => {
              console.log(err)
          }
      )
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div id="artistInput">
            <Search placeholder="input search text" onSearch={ value => this.searchArtist(value)} enterButton />
          </div>
          <ul>
            <li>{this.state.artist}</li>
            <li>{this.state.artistId}</li>
          </ul>
        </header>
      </div>
    );
  }
}

export default Playlist;