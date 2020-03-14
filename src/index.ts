const URL = 'https://api.vimeo.com';

// function g() {
//   console.log("g(): evaluated");
//   return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
//       console.log("g(): called");
//   }
// }


function log() {
  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log('LOG:', propertyKey);
  }
}

class VimeoApi {

  static Events = {
    VIMEO_READY:'vimeoReady'
  }

  constructor({
      clientId = '',
      debug = false
  } = {}) {
    this.debug = debug;
    this.clientId = clientId;
    this.authorization = false;
    this.headers = {
        'Content-Type': 'application/json',
        'Accept':'application/vnd.vimeo.*+json;version=3.4',
        'Authorization':`Bearer ${this.clientId}`
    };

    this.verify();

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

      let event = new CustomEvent(VimeoApi.Events.VIMEO_READY,{
        detail: {
          test:"test"
        }
      });

      document.dispatchEvent(event);

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

  on(event, cb){
    document.addEventListener(event, cb)
  }

  off(event, cb){
    document.removeEventListener(event, cb)
  }

}

window.VimeoApi = VimeoApi;
