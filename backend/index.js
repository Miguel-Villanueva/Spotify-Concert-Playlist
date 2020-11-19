/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
require('dotenv').config()
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var ticketmasterRouter = require("./ticketmasterAPI");

var client_id = process.env.SPOTIFY_ID; // Your client id
var client_secret = process.env.SPOTIFY_SECRET; // Your secret
var redirect_uri = 'http://3.139.102.236:8888/callback'; // Your redirect uri


var jsonParser = bodyParser.json() // create application/json parser
var urlencodedParser = bodyParser.urlencoded({ extended: false }) // create application/x-www-form-urlencoded parser

const mysql = require('mysql');


const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.use("/ticketmasterAPI", ticketmasterRouter);

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email playlist-modify-public user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('http://localhost:3000/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

con.connect(function(err) {
  console.log("Connected!");
})

app.post('/insert_artist', jsonParser, function(req, res) {
  try {
    const artist_name = req.body.artist_name
    if(artist_name) {
      res.sendStatus(200)
    }
    con.query(`SELECT ArtistName, ArtistCount FROM SearchedArtists WHERE ArtistName="${artist_name}";`, function(err, result) {
      if(result.length) { // if artist is searched before update count
        con.query(`UPDATE SearchedArtists SET ArtistCount=${result[0].ArtistCount + 1} WHERE ArtistName="${artist_name}";`)
      }
      else { // if it's the first query of artist's, insert 
        con.query(`INSERT INTO SearchedArtists (ArtistName, ArtistCount) VALUES ("${artist_name}", 1);`)
      }
    })
  } catch(err) {
    console.log(err)
  }
})

app.get('/get_artists', function(req, res) {
  try {
    con.query('SELECT * FROM SearchedArtists ORDER BY ArtistCount DESC;', (err, result) => {
      res.send(result)
    })
  } catch (error) {
    res.send('Fetching most searched artists has failed')
  }
})

app.post('/insert_zipcode', jsonParser, function(req, res) {
  try {
    const zipcode = req.body.zip_code
    if(zipcode) {
      res.sendStatus(200)
    }
    con.query(`SELECT ZipCode, ZipCodeCount FROM ZipCodes WHERE ZipCode="${zipcode}";`, function(err, result) {
      if (err) throw err;
      if(result.length) { // if artist is searched before update count
        con.query(`UPDATE ZipCodes SET ZipCodeCount=${result[0].ZipCodeCount + 1} WHERE ZipCode="${zipcode}";`)
      }
      else { // if it's the first query of artist's, insert 
        con.query(`INSERT INTO ZipCodes (ZipCode, ZipCodeCount) VALUES ("${zipcode}", 1);`)
      }
    })
  } catch(err) {
    console.log(err)
  }
})

app.get('/get_zipcodes', function(req, res) {
  try {
    con.query('SELECT * FROM ZipCodes ORDER BY ZipCodeCount DESC;', (err, result) => {
      res.send(result)
    })
  } catch (error) {
    res.send('Fetching most searched artists has failed')
  }
})

console.log('Listening on 8888');
app.listen(8888);