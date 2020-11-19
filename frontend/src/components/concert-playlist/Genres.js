import React, {Component} from 'react';
import {Row, Button, Input, FormGroup, Form, Col, Container} from 'reactstrap'
import Artists from './Artists';
import '../normal-playlist/playlist.css'; 
import Axios from 'axios';

class Genres extends Component {
  constructor(props)
  {
    super(props);
    this.state={
      loaded: false,
      concerts: [],
      isSubmitted: false,
      genres: []
    };
    this.handleToggle = this.handleToggle.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  componentDidMount(){
    this.callAPI();
  }

  callAPI(){
    fetch('http://3.139.102.236:8888/ticketmasterAPI?zip='+this.props.zip).then(
      res => res.json()
    ).then(json => 
      this.setState({
        loaded:true,
        concerts: json
      })
    ).catch(err => console.log(err))
  }

  handleSubmit = (event) =>{
    console.log(this.state.genres);
    this.setState({isSubmitted: true});
    event.preventDefault();
  }
  handleToggle = (event) =>{
    if(event.target.checked){
      this.setState({
        genres: [...this.state.genres, event.target.value]
      });
      this.setState({isSubmitted: false});
    } else{
      let remove = this.state.genres.indexOf(event.target.value);
      this.setState({
        genres: this.state.genres.filter((_,i) => i !== remove)
      }, 
        () => {
          console.log('genres', this.state.genres);
        });
        this.setState({isSubmitted: false});
    }
  }
 
  render(){
    var{loaded, concerts} = this.state;
    if(!loaded)
    {
      return <div>Genres Loading...</div>
    }
    else if(concerts._embedded == undefined || concerts._embedded.events == undefined || parseInt((concerts.page.totalElements) == 0)){
      return <div><br/>There are no concerts in your area</div>;
    }
    else{
      const genreSet = new Set();
      const genreCheckboxes = [];
      
      //Add all genres and subgenres to genreName and genreID set
      concerts._embedded.events.map(event => {
          //Add genre names and genreIDs
          genreSet.add(event.classifications[0].genre.name.concat("|".concat(event.classifications[0].genre.id)));
          

       });
      
      genreSet.forEach(genre => {
        genreCheckboxes.push(<div key={genre.split("|")[0]}>
          <Input type="checkbox" 
            id={genre.split("|")[0]} 
            name={genre.split("|")[0]} 
            value={genre.split("|")[1]}
            onClick={this.handleToggle}/>
             <label id="checkboxList"> {genre.split("|")[0]}</label>
          </div>)
      })
      return (
        <Container>
          
          <Row id="playlistPage-row">
            
            <Col>
                <h2>Step 2: </h2>
                <h3>Choose Your Genres <br/></h3>
                <Form className="Genres" onSubmit={this.handleSubmit}>      
        
                  <FormGroup>      
                    {genreCheckboxes}
                  </FormGroup>
                  <Button id="submit-button" type="submit" value={this.state.genres}>Submit Genres</Button>
             
                </Form>
                
                {this.state.isSubmitted && <div><Artists genreCodes= {this.state.genres} zip = {this.props.zip}/></div>}
            </Col>
          </Row>
        </Container>
      );
    }
  }   
}

export default Genres;