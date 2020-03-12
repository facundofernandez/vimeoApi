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
      //console.log(user);

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

  async getVideos(url = `${URL}${this.uri}/videos`) {
    console.log('GET VIDEOS: ', url)
    if(!this.authorization) return;

    let resp = await fetch(url,{
      headers: this.headers
    });

    if(!resp.ok){
        if(resp.status === 401) throw new Error("Client id erroneo")
    }

    let data = await resp.json();

    return {
      ...data,
      next: ()=> this.getVideos(`${URL}${data.paging.next || `${this.uri}/videos` }`),
      previous: ()=> this.getVideos(`${URL}${data.paging.previous || `${this.uri}/videos` }`),
      first: ()=> this.getVideos(`${URL}${data.paging.first}`),
      last: ()=> this.getVideos(`${URL}${data.paging.last}`)
    }
  }
}

window.Vimeo = new VimeoApi({
  clientId: '5457195e158ae8ec80d43a6a2d9257b3'
});

