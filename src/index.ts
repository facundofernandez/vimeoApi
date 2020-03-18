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

  static Sort = {
    Direction: {
      ASC: 'asc',
      DESC: 'desc'
    },
    ALPHABETICAL:'alphabetical',
    COMMENTS:'comments',
    DATE:'date',
    DURATION:'duration',
    LAST_USER_ACTION_EVENT_DATE:'last_user_action_event_date',
    LIKES:'likes',
    MODIFIED_TIME:'modifiedTime',
    PLAYS:'plays'
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

  async getVideos({url = `${URL}${this.uri}/videos`, options = {}}) {
    if(!this.authorization) return;

    let searchParams = new URLSearchParams('');

    for(let option in options){
      searchParams.append(option,options[option])
    }

    url = url.indexOf('?') === -1
      ? `${url}?${searchParams.toString()}`
      : searchParams.toString() !== ''
        ? `${url}&${searchParams.toString()}`
        : url;

    let resp = await fetch(url,{
      headers: this.headers
    });

    if(!resp.ok){
        if(resp.status === 401) throw new Error("Client id erroneo")
    }

    let data = await resp.json();

    return {
      ...data,
      next: ()=> this.getVideos({url:`${URL}${data.paging.next || `${this.uri}/videos` }`}),
      previous: ()=> this.getVideos({url:`${URL}${data.paging.previous || `${this.uri}/videos` }`}),
      first: ()=> this.getVideos({url:`${URL}${data.paging.first}`}),
      last: ()=> this.getVideos({url:`${URL}${data.paging.last}`})
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
