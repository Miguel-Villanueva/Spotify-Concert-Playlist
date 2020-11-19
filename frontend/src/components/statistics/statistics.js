import React, { useEffect, useState } from "react";
import { Row, Col, Spin } from "antd";
import { Table } from "reactstrap";
import Axios from "axios";
import "./statistics.scss";

const Statistics = () => {
  const [mostSearchedArtists, setMostSearchedArtists] = useState([]);
  const [mostSearchedZipcodes, setMostSearchedZipcodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const getMostSearchedArtists = async () => {
    await Axios.get(`http://3.139.102.236:8888/get_artists`)
      .then((res) => {
        setMostSearchedArtists(res.data);
        console.log(res.data)
      })
      .then(() => {
        setLoading(false)
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getMostSearchedZipcodes = async () => {
    await Axios.get(`http://3.139.102.236:8888/get_zipcodes`)
      .then((res) => {
        setMostSearchedZipcodes(res.data);
        console.log(res.data)
      })
      .then(() => {
        setLoading(false)
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getMostSearchedArtists();
    getMostSearchedZipcodes();
  }, []);

  return (
    <Row id="statistics-outter-row">
      <Col id="statistics-outter-col">
        <Spin className="statistics-spin" size="large" tip="Loading..." spinning={loading}>
          <Row id="statistics-row">
            <Col id="statistics-col">
              <h3>MOST SEARCHED ARTISTS</h3>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Artist Name</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {mostSearchedArtists !== undefined &&
                    mostSearchedArtists.map((val, key) => {
                      return (
                        <tr>
                          <th scope="row">{key + 1}</th>
                          <td>{val.ArtistName}</td>
                          <td>{val.ArtistCount}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </Table>
            </Col>
            <Col id="statistics-col">
              <h3>MOST SEARCHED ZIP CODES</h3>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Zipcode</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {mostSearchedZipcodes !== undefined &&
                    mostSearchedZipcodes.map((val, key) => {
                      return (
                        <tr>
                          <th scope="row">{key + 1}</th>
                          <td>{val.ZipCode}</td>
                          <td>{val.ZipCodeCount}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Spin>
      </Col>
    </Row>
  );
};

export default Statistics;
