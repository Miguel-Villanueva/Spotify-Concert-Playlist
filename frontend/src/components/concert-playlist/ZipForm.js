import React, { Component } from 'react';
import {Container, Row, Col, Button, Form, FormGroup, Label, Input} from 'reactstrap';
import Genres from './Genres';
import '../normal-playlist/playlist.css'; 
import Axios from 'axios'

export default class ZipForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      zip: '',
      isSubmitted: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange = (event) =>
  {
    this.setState({zip: event.target.value});
    this.setState({isSubmitted: false});
  }
  handleSubmit = (event) =>{
    this.setState({isSubmitted: true});
    this.updateDB(this.state.zip)
    event.preventDefault();

  }

  updateDB = async(zipcode) => {
    await Axios.post(`http://3.139.102.236:8888/insert_zipcode`,{
      zip_code: zipcode
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
      <Container>
        <Row id="playlistPage-row">
          <Col>
           
            <h2>Step 1: </h2>
            <h3>Enter a Zip Code</h3>
              <Form className ="ZipForm" onSubmit={this.handleSubmit}>
                <FormGroup>
                  <Label for="zipcode"></Label>
                    <Input type="text" value={this.state.zip} onChange={this.handleChange} id="zipcodeInput" placeholder="Enter Zipcode" />
                </FormGroup>
              <Button id="submit-button" type ="submit" value={this.state.zip} placeholder="submit">Submit Zipcode</Button>
        
          </Form>
          {this.state.isSubmitted && <Genres zip = {this.state.zip}/>}
        </Col>  
      </Row>
    </Container>
  );
  }

}