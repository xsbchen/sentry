export class Request {}

const respond = (isAsync, fn, ...args) => {
  if (fn) {
    if (isAsync) {
      setTimeout(() => fn(...args), 1);
    } else {
      fn(...args);
    }
  }
};

class Client {
  static mockResponses = [];

  static clearMockResponses() {
    Client.mockResponses = [];
  }

  static addMockResponse(response) {
    Client.mockResponses.push({
      statusCode: 200,
      body: '',
      method: 'GET',
      ...response
    });
  }

  static findMockResponse(url, options) {
    return Client.mockResponses.find(response => {
      return url === response.url && (options.method || 'GET') === response.method;
    });
  }

  static mockAsync = false;

  merge(params, options) {
    let path = '/projects/' + params.orgId + '/' + params.projectId + '/issues/';
    return this.request(path, {
      method: 'PUT',
      data: {merge: 1},
      ...options
    });
  }

  request(url, options) {
    let response = Client.findMockResponse(url, options);
    if (!response) {
      // eslint-disable-next-line no-console
      console.error(
        'No mocked response found for request.',
        url,
        options.method || 'GET'
      );
      let resp = {
        status: 404,
        responseText: 'HTTP 404',
        responseJSON: null
      };
      respond(Client.mockAsync, options.error, resp);
    } else if (response.statusCode !== 200) {
      let resp = {
        status: response.statusCode,
        responseText: JSON.stringify(response.body),
        responseJSON: response.body
      };
      respond(Client.mockAsync, options.error, resp);
    } else {
      respond(
        Client.mockAsync,
        options.success,
        response.body,
        {},
        {getResponseHeader: () => {}}
      );
    }
    respond(Client.mockAsync, options.complete);
  }
}

export {Client};
