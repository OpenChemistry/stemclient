export function authenticateFlask(girderToken: string) : Promise<boolean> {
  return fetch(`${window.origin}/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({girderToken})
  })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Unable to authenticate with the flask backend');
      }
      return true;
    })
}
