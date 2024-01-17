import {AuthManager} from "blaise-login-react-client";

type HeadersObject = Record<string, string>;

async function requestPromiseJson(method: string, url: string, body: FormData | null = null, headers: HeadersObject = {}): Promise<[number, JSON]> {
  const authManager = new AuthManager();

  try {
    const response = await fetch(url, {
      method,
      body,
      headers: Object.assign({}, headers, authManager.authHeader())
    });

    if (response.status === 204) {
      return [response.status, JSON.parse("{}")];
    } else {
      const data = await response.json();
      return [response.status, data];
    }
  } catch (error) {
    return [0, JSON.parse("{}")];
  }
}

async function requestPromiseJsonList<T>(method: string, url: string, body = null): Promise<[boolean, T[]]> {
  const authManager = new AuthManager();

  try {
    const response = await fetch(url, {
      method,
      body,
      headers: authManager.authHeader()
    });

    const data = await response.json();

    if (response.status === 200) {
      if (!Array.isArray(data)) {
        return [false, []];
      }
      return [true, data];
    } else if (response.status === 404) {
      return [true, data];
    } else {
      return [false, []];
    }
  } catch (error) {
    return [false, []];
  }
}

export {requestPromiseJson, requestPromiseJsonList};
