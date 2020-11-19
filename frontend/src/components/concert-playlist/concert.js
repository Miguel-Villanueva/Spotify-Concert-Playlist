import React, { Component } from 'react';
import 'antd/dist/antd.css';
import {Button, Input, Container, Row, Col, Form, FormGroup} from 'reactstrap'
import '../normal-playlist/playlist.css'; 
import SpotifyWebApi from 'spotify-web-api-js';
import {Link} from "react-router-dom";
import EmbeddedConcertPlaylist from '../embedded-playlist/embeddedConcertPlaylist';
const { Search } = Input;

const  spotifyApi = new SpotifyWebApi();


class Concert extends Component {
  constructor(props) {
    super(props);
    this.state={
      userId: '',
      userPlaylistId: '',
      artist: '',
      artistId: '',
      topTracks: [],
      topTracksIds: [],
      isSubmitted: false,
      playlistName: 'Playlist App TEST',
      playlistDescription: 'Created with Playlist App TEST',
      errorMessage: false,
      createdPlaylist: false,
      random: Math.floor((Math.random()*1000) + 1),
      iframe: ''

    }
  }

  componentDidMount(){
    this.getUser();
    if(this.props.location.artists){
      this.props.location.artists.concertList.forEach(artist => this.searchArtist(artist));
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
            if(data !== undefined && data.artists.items.length != 0) {
                
                let artistName = data.artists.items[0].name
                let id = data.artists.items[0].id
                this.setState({
                    artist: artistName, // index is 0 because most popular query's index is 0 
                    artistId: id // index is 0 because most popular query's index is 0 
                })
            }
            else{
              //HANDLE NO SPOTIFY ARTIST FOUND ERROR
              this.setState({errorMessage: true})
            }
            this.getTopTracks(this.state.artistId, 'US');
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
      spotifyApi.createPlaylist(this.state.userId, {name: this.state.playlistName, description: this.state.playlistDescription}).then(
          (data) => {
            console.log(data.id);
              this.setState({
                  userPlaylistId: data.id,
                  iframe: `https://open.spotify.com/embed/playlist/${data.id}`
              })  
              this.addTracksToPlaylist(data.id, this.state.topTracksIds)     
                     
          },
          (err) => {
              console.log(err)
          }
      )
     
  }

  addTracksToPlaylist = (playlistId, topTracksIds) => {
      spotifyApi.addTracksToPlaylist(playlistId, topTracksIds).then(
          (data) => {
              console.log(data)
          },
          (err) => {
              
              console.log(err)
          }
      )
  }
  handleNameInput = (event) => {
    this.setState({
      playlistName: event.target.value
    })
  }
  handleDescriptionInput = (event) => {
    this.setState({
      playlistDescription: event.target.value
    })
  }
  
  handleCreate = (event) => {
    this.createPlaylist();
    this.setState({
      createdPlaylist: true
    })
    event.preventDefault();
    
  }

  render() {
    return (
      <Container className="playlistPage-container">
        {!this.state.createdPlaylist && 
          <Row id="playlistPage-row">
            <Col>
                <h3>Customize Playlist</h3>
                <Form>
                  <FormGroup>
                    <Input onChange={this.handleNameInput} placeholder="Playlist Name" />
                    <Input placeholder="Playlist Description" onChange={this.handleDescriptionInput} /> 
                  </FormGroup>
                  {!this.state.createdPlaylist && <Button id="submit-button" placeholder="finalize playlist" type="primary" onClick={this.handleCreate}>Add Playlist to Spotify</Button>}
                  
                 
                </Form>
                <br/>
                {this.state.errorMessage && <div>Some of the selected artists were not found on Spotify</div>}
                
            </Col>
            
          </Row>
        }
        {this.state.createdPlaylist && 
          <Row id="iframe-row">
            <Col >
              <EmbeddedConcertPlaylist key={this.state.random} link={this.state.iframe}/>
            
              <Link to={{pathname:'../concertPlaylist'}}>
                <Button id="button-link" variant="contained" type="submit">Start Over</Button>
              </Link>
            </Col>
        </Row>}
        
      </Container>
    );
  }
}

export default Concert;