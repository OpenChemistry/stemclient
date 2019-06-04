let baseURL = `${window.location.origin}/api/v1`;
let girderToken: string | undefined;

const makeRequest = (url: string, method: string, params: any = {}, body: any = undefined, headers: any = {}, extra: any = {}) => {
  headers = {...headers, 'Girder-Token': girderToken};

  if (body) {
    if (!headers['Content-Type']) {
      headers = {...headers, 'Content-Type': 'application/json'};
    }

    if (headers['Content-Type'] === 'application/json') {
      body = JSON.stringify(body);
    }
  }

  const fullURL = `${baseURL}/${url}?${new URLSearchParams(params).toString()}`;
  const requestParams = {...extra, method, headers, body};
  return fetch(fullURL, requestParams);
}

const setBaseURL = (url: string) => {
  baseURL = url;
};

const setToken = (token: string | undefined) => {
  girderToken = token;
}

const getBaseURL = () => baseURL;

const getToken = () => girderToken;

const get = (url: string, params: any = {}, body: any = undefined, headers: any = {}, extra: any = {}) => {
  return makeRequest(url, 'GET', params, body, headers, extra);
};

const post = (url: string, params: any = {}, body: any = undefined, headers: any = {}, extra: any = {}) => {
  return makeRequest(url, 'POST', params, body, headers, extra);
};

const put = (url: string, params: any = {}, body: any = undefined, headers: any = {}, extra: any = {}) => {
  return makeRequest(url, 'PUT', params, body, headers, extra);
};

const patch = (url: string, params: any = {}, body: any = undefined, headers: any = {}, extra: any = {}) => {
  return makeRequest(url, 'PATCH', params, body, headers, extra);
};

const _delete = (url: string, params: any = {}, body: any = undefined, headers: any = {}, extra: any = {}) => {
  return makeRequest(url, 'DELETE', params, body, headers, extra);
};

const girderClient = () => ({
  get,
  post,
  put,
  patch,
  delete: _delete,
  getBaseURL,
  setBaseURL,
  getToken,
  setToken
});

export default girderClient;
