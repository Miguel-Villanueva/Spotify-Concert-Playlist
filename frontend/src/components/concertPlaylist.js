import React, { Component } from 'react';
import logo from '../logo.svg';
import '../App.css';
import { Input } from 'antd';
import 'antd/dist/antd.css';
import {Button, Form} from 'reactstrap'

import '../styles/playlist.css'
const { Search } = Input;

//TO BE REPLACED WITH PROPS
var concertArtists = ['Frank Ocean', 'Kendrick Lamar', 'Dr. Dre'];

let Spotify = require('spotify-web-api-js');
let spotifyApi = new Spotify();
spotifyApi.setAccessToken('BQDb99h_9FpoNOPFOQoDWdnTrrBnF5lon8pyNcm-Zgf3H8aKg385mAU3QeQHqFy9KDh3ghoHX1kMOmP4V2D5-Mu9_mw-gaEYYG1oouGBkdAiL73C4BTuwtZZTLQ8sNLU3HiPK6zd7pAvM3QHVfQQY5ecTc63Y1w0_VBLfKhDrIFxiB7W-rltLFDDu3z8uVKaZIgY&refresh_token=AQC-CFb2J08uWzyiLPJtNo894EIVojCI8771RuHQp6L93ABak86EKaGoR5TLd9I6A7UeMDw6qTNdhmmopxEyqgvFdNYrNMkTdrvim7j784v_gojuB0J-ltvi87IJCfL5z6Y');

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

  //ISSUE: MAKES A NEW PLAYLIST EVERY TIME PAGE IS REFRESHED
  componentDidMount(){
    this.getUser();
    concertArtists.forEach(artist => this.searchArtist(artist));
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
            this.createPlaylist();
            
        },
        (err) => {
        console.error(err);
        }
    );
  }

  searchArtist = (artist) => {
    console.log(artist);
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
          {/*EDIT TO STOP MAKING REPEATED ARTIST ENTRIES*/}
          <Button placeholder="finalize playlist" onClick={this.addTracksToPlaylist}>Finalize!</Button>
        </header>
      </div>
    );
  }
}

export default Playlist;