const URL = 'https://api.vimeo.com';

class VimeoApi {
  constructor({
      clientId
  }) {
    this.clientId = clientId || '';
    this.authorization = false;
    this.headers = {
        'Content-Type': 'application/json',
        'Accept':'application/vnd.vimeo.*+json;version=3.4',
        'Authorization':`Bearer ${this.clientId}`
    };


    this.verify()
  }

  async verify() {
    try {
      let resp = await fetch(`${URL}/oauth/verify`,{
          headers: this.headers
      });

      if(!resp.ok){
          if(resp.status === 401) throw new Error("Client id erroneo")
      }

      let {user} = await resp.json()

      let {uri,name,link} = user;

      this.uri = uri;
      this.name = name;
      this.authorization = true;
      console.log(user);

    } catch (error) {
      console.log(error);
    }
  }

  getAccessToken() {

    if(!this.authorization) return;

    return fetch(
      'https://api.vimeo.com/oauth/authorize/client',
      {
          method: 'POST',
          body: JSON.stringify({
              grant_type:"client_credentials",
              scope:"public"
          }),
          headers:{
              'Content-Type': 'application/json',
              'Accept':'application/vnd.vimeo.*+json;version=3.4',
              'Authorization':`Bearer ${this.clientId}`
          }
      })
      .then(function(response) {
          return response.json();
      })
      .then(function(myJson) {
          console.log(myJson);
      });
  }

  async getVideos() {

    if(!this.authorization) return;

    return fetch(
      `${URL}/${this.uri}/videos`,
      {
          method: 'GET',
          headers:{
              'Content-Type': 'application/json',
              'Accept':'application/vnd.vimeo.*+json;version=3.4',
              'Authorization':`Bearer ${this.clientId}`
          }
      })
      .then(function(response) {
          return response.json();
      })
      .then((myJson)=> {
          let {data} = myJson
          console.log(myJson);
          console.log(data);
      });

  }
}

window.Vimeo = new VimeoApi({
    clientId: '5457195e158ae8ec80d43a6a2d9257b3'
})
