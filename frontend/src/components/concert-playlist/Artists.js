import React, {Component} from 'react';
import {Button, Input, Form, Container,Row, Col} from 'reactstrap';
import {Link} from "react-router-dom";
import '../normal-playlist/playlist.css'; 

class Artists extends Component{
    constructor(props){
        super(props);
        this.state={
            loaded: false,
            concerts: [],
            artists: [],
            isSubmitted: false,
        };
        this.handleToggle = this.handleToggle.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentDidMount()
    {
        this.callAPI();
    }

    callAPI(){
        var genreString = "";
        this.props.genreCodes.forEach(genre => {
            genreString = genreString.concat(genre.concat(","));
        });
        console.log(`http://3.139.102.236:8888/ticketmasterAPI?zip=`+this.props.zip+`&genreId=${genreString}`);
        fetch(`http://3.139.102.236:8888/ticketmasterAPI?zip=`+this.props.zip+`&genreId=${genreString}`).then(
            res => res.json()).then(json => {
                this.setState({
                    loaded: true,
                    concerts: json,
                })
            });
    }

    handleSubmit = (event) =>{
        console.log(this.state.genres);
        this.setState({isSubmitted: true});
        
        event.preventDefault();
    }
    handleToggle = (event) =>{
        if(event.target.checked){
          this.setState({
            artists: [...this.state.artists, event.target.value]
          });
          this.setState({isSubmitted: false});
        } else{
          let remove = this.state.artists.indexOf(event.target.value);
          this.setState({
            artists: this.state.artists.filter((_,i) => i !== remove)
          }, 
            () => {
              console.log('artists', this.state.artists);
            });
            this.setState({isSubmitted: false});
        }
      }
    render(){
        var{loaded, concerts} = this.state;
        var attractionError = false;
        if(!loaded){
            return <div>Artists Loading...</div>
        }
        else if(concerts._embedded == undefined || concerts._embedded.events == undefined){
            attractionError = true;
        }
        else{
            var artistSet = new Set();
            var artistCheckbox = [];
            concerts._embedded.events.map(event => {
                if(event._embedded.attractions){
                    event._embedded.attractions.map(attraction =>{
                        artistSet.add(attraction.name);
                    })
                }
                else{
                    attractionError = true;
                }
            })
            artistSet.forEach(artist =>{
                artistCheckbox.push(<div key={artist}>
                    <Input type="checkbox"
                        id={artist}
                        name={artist}
                        value={artist}
                        onClick={this.handleToggle}/>
                        <label id="checkboxList">{artist}</label>
                </div>)
            })
        }
        return <Container className="App">
            <Row id="playlistPage-row">
                <Col>
                <h2>Step 3: </h2>
                <h3>Choose your artists!</h3>
                <Form className="Artists" onSubmit={this.handleSubmit}>
                    {artistCheckbox}
                    <Link to={{
                        pathname:'/concert',
                        artists:{
                            concertList: this.state.artists
                        }
                    }}><Button id="submit-button" type="submit">Submit Artists</Button></Link>
                </Form>
                {attractionError && <div><br></br>Some artists were not included</div>}
                {this.state.isSubmitted && this.state.artists}
                </Col>
            </Row>
        </Container>
    }
}
export default Artists;