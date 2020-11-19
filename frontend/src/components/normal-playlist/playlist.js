import React, { Component } from 'react';
import { Input, Button, Select } from 'antd';
import { Container, Row, Col } from 'reactstrap';
import SpotifyWebApi from 'spotify-web-api-js';
import EmbeddedPlaylist from '../embedded-playlist/embeddedPlaylist'
import 'antd/dist/antd.css';
import './playlist.css';
import Axios from 'axios';


const { Search, TextArea } = Input;
const { Option } = Select;

const spotifyApi = new SpotifyWebApi();

class Playlist extends Component {
  constructor(props) {
    super(props);
    this.state={
      user: {
          id: '',
          playlistId: '',
          iframe:''
      },
      artist: {
          name: '',
          id: ''
      },
      playlistName: 'Playlist App',
      playlistDescription: 'Created with Playlist App',
      selectedArtists: [], 
      searchedArtists: [],
      topTracksIds: [],
      displayPlaylist: 'none',
      random: 0
    }
  }

  componentDidMount() {
      this.getUser();
  }

  getUser = () => {
      spotifyApi.getUserPlaylists().then(
        (data) => {
            this.setState({
                user: { id : this.sliceUserId(data.href)}
            })
        },
        (err) => {
        console.error(err);
        }
    );
  }
  
  sliceUserId = (url) => {
    let string = url.split(/[/?]/);
    return string[5]
  }

  //this is for showing the artist names before creating playlist
  //if(this.state.searchedArtists.includes(data.artists.items[0].name))
  getArtist = (artist) => {
    spotifyApi.searchArtists(artist).then(
        (data) => {
            if(data !== undefined) {
                for(let i = 0; i < data.artists.items.length; i++) {
                    if(!this.state.searchedArtists.includes(data.artists.items[i].name)) {
                        this.setState({ // change to index 1 if query is same
                            searchedArtists: this.state.searchedArtists.concat(data.artists.items[i].name),
                            selectedArtists: this.state.selectedArtists.concat(data.artists.items[i].name)
                        })
                        this.updateDB(data.artists.items[i].name)
                        break;
                    }
                }
            }
        },

        (err) => {
            console.log(err)
        }
    );
  }

  //this is for creating playlist
  searchArtist = (artist) => {
    artist.map((artistName, key) => {
        spotifyApi.searchArtists(artistName).then(
            (data) => {
                if(data !== undefined) {
                    this.setState({
                        artist:{name: data.artists.items[0].name, id : data.artists.items[0].id}  // index is 0 because most popular query's index is 0 
                    }, () => {
                        this.getTopTracks(this.state.artist.id, 'TR'); // a callback, will be executed after setting state
                    });
                }          
            },
            (err) => {
                console.log(err)
            }
        );
    })
  }


  //tracks that we are going to add to playlist
  getTopTracks = (artistId, country) => {
      spotifyApi.getArtistTopTracks(artistId, country).then(     
        (data) => {
            data.tracks.map((track) => {
                this.setState({
                    topTracksIds:this.state.topTracksIds.concat(track.uri) //storing track id's in an array
                })
            })

            this.addTracksToPlaylist(this.state.user.playlistId, this.state.topTracksIds)
          },

        (err) => {
            console.log(err)
        }
      )
  }

  addTracksToPlaylist = (playlistId, topTracksIds) => {
    spotifyApi.addTracksToPlaylist(playlistId, topTracksIds).then(
        (data) => {
          //this.resetIframe()
        },
        (err) => {
            console.log(err)
        }
    )

    this.setState({
        topTracksIds: []
    })
  }

  handleSelect = (value) => {
    this.setState({
        selectedArtists: this.state.selectedArtists.concat(value)
    }, () => {
        console.log(this.state.selectedArtists)
    }) 
  }

  handleDeselect = (value) => {
    this.setState({
        selectedArtists: this.state.selectedArtists.filter(name => !name.includes(value))
    }, () => {
        console.log(this.state.selectedArtists)
    });


  }

  handleCreate = () => {
    this.createPlaylist(this.state.user.id, this.state.playlistName, this.state.playlistDescription);
    this.setState({
        displayPlaylist: 'block',
      })

    setTimeout(() => { // iframe needs a reload to show songs
        this.setState({ random: this.state.random + 1 })
    }, 700);

    setTimeout(() => { // selected songs dissapear 
        this.setState({
            selectedArtists: [],
            topTracksIds: []
        })
    },3000)
  }

  createPlaylist = (userId, name, description) => {
    if(!name.length > 0) {
        name = 'Playlist App';
    }
    if(!description.length > 0) {
        description = 'Created with Playlist App'
    }
    
    spotifyApi.createPlaylist(userId, {name, description}).then(
      (data) => {

          console.log('once' + this.state.user.id)
          this.setState({
              user: { id: userId ,playlistId: data.id, iframe: `https://open.spotify.com/embed/playlist/${data.id}` } 
          }, () => {
              this.searchArtist(this.state.selectedArtists)
          })
          
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

  updateDB = async (name) => {
    await Axios.post(`http://3.139.102.236:8888/insert_artist`, {
        artist_name: name
    })
    .then((res) => {
        console.log(res)
    })
    .catch((err) => {
        console.log(err)
    })

  }

  render() {
    return (
        <Container className="playlistPage-container">
            {this.state.displayPlaylist !== 'none' ? <Row id="iframe-row"><EmbeddedPlaylist key={this.state.random} link={this.state.user.iframe}/></Row> : ''}
            <Row id="playlistPage-row">
                <Col>
                    <div id="form-container">
                        <div id="artistInput">
                            <div id="searchArtist">
                                <Search
                                    id="searchArtistInput"
                                    placeholder="Search Artist"
                                    onSearch={ value => this.getArtist(value)}
                                    enterButton
                                />
                            </div>
                            <Button style={{display: this.state.selectedArtists.length > 0 ? 'block' : 'none'}} id ="create-button" type="primary" onClick={this.handleCreate}> Create Playlist </Button>
                        </div>
                        <div id="pickArtists">
                            <Select
                            mode="multiple"
                            placeholder="Select Artists"
                            style={{display: this.state.searchedArtists.length > 0 ? 'block' : 'none'}}
                            value={this.state.selectedArtists}
                            onSelect={this.handleSelect}
                            onDeselect={this.handleDeselect}
                            optionLabelProp="label"
                            >
                            {this.state.searchedArtists.map((artist, key) => {
                                return (
                                    <Option id = {artist} key={key} value={artist} label={artist}>
                                        <div className="demo-option-label-item">
                                            <span role="img" aria-label={key}>{artist}</span>
                                        </div>
                                    </Option>
                                );
                            })}
                            </Select>
                        </div>
                        <div id="playlist-properties" style={{display: this.state.selectedArtists.length > 0 ? 'block' : 'none'}}>
                            <Input id="name-input" onChange={this.handleNameInput} placeholder="Playlist Name" />
                            <TextArea id="description-input" onChange={this.handleDescriptionInput} rows={3} /> 
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
      );
  }
}

export default Playlist;
