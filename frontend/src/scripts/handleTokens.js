import generateRandomString from './randomString';
import { encode } from './encoder';
import base64 from 'base-64';

export const checkIfRefreshTokenWorking = (refresh_token) => new Promise((resolve, reject) => {
  fetch('http://3.139.102.236:8888/refresh_token?refresh_token='+refresh_token)
  .then(response => {
    resolve(true)
  })
  .catch(err => {
    reject(false)
  })
})

export const checkIfTokenActive = (decryptedToken, spotifyInstance) => new Promise((resolve, reject) => {
  spotifyInstance.setAccessToken(decryptedToken);
  spotifyInstance.getUserPlaylists().then(
    (data) => {
        resolve(true);
    },
    (err) => {
      reject(false);
    }
  )
})

export const generateNewAccessToken = (refresh_token) => new Promise((resolve, reject) => {
  fetch('http://3.139.102.236:8888/refresh_token?refresh_token='+refresh_token)
  .then(response => response.json())
  .catch(err => {
    reject(false)
  })
  .then(data => {
    let key = generateRandomString(15);
    localStorage.setItem('key', key);
    localStorage.setItem('access_token', encode(data.access_token, key));
    resolve(true)
  })
  .catch(err => {
    reject(false)
  })
})

export const storeTokens = (access_token, refresh_token,key) => {
  localStorage.setItem('key', key);
  localStorage.setItem('access_token', encode(access_token, key));
  localStorage.setItem('refresh_token', refresh_token);
}

export const removeTokens = () => {
  localStorage.removeItem('key')
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}
