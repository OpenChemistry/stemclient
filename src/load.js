
export function load(onLoad) {
  console.log('load');
  var request = new Request('raw.bin');

  fetch(request).then(function(response) {
    return response.arrayBuffer();
  }).then(onLoad);
};

