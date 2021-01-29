import React from 'react';

const geoCode = (lat, lng) => {
  return new Promise ((resolve, reject) => {
    // Instantiate a map and platform object:
    let platform = new window.H.service.Platform({
      'apikey': 'Swhnjo3c30WglQoyLs1CSt0cTbfUC2HqEzV6LjYOGPQ',
    });

    // Create the parameters for the reverse geocoding request:
    let reverseGeocodingParameters = {
        prox: `${lat},${lng}`,
        mode: 'retrieveAddresses',
        maxresults: 1
      };

    // Define a callback function to process the response:
    function onSuccess(result) {
      let location = result.Response.View[0].Result[0];
      return resolve(location.Location.Address)
    };

    // Get an instance of the geocoding service:
    let geocoder = platform.getGeocodingService();

    geocoder.reverseGeocode(
      reverseGeocodingParameters,
      onSuccess,
      function(e) { 
        alert(e);
        return reject(e)
      });
    })
}


class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      items: []
    }

    this.dropHandler = this.dropHandler.bind(this)
    this.dragOverHandler = this.dragOverHandler.bind(this)
  }

  dropHandler(ev) {
    ev.preventDefault()
    if (ev.dataTransfer.items) {
      let geoCodePromises = []
      // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop#process_the_drop
      // Use DataTransferItemList interface to access the file(s)
      for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        let file = ev.dataTransfer.items[i].getAsFile();
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          file.text()
            .then((response) => {
              const items = JSON.parse(response)
              for (let i = 0; i <items.length; i++) {
                geoCodePromises.push(geoCode(items[i].Latitude, items[i].Longitude))
              }
              Promise.all(geoCodePromises).then((res) => {
                // append address to items 
                this.setState({
                  items: items.map((item, index) => {
                    return {
                      ...item,
                      address: res[index].Label
                    }
                  })
                })
              })
            })
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (let i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
      }
    }
  }

  dragOverHandler(event) {
    event.preventDefault()
  }

  render() {
    return <main className="App">
      <div 
        id="drop_zone"
        onDrop={(event) => this.dropHandler(event)}
        onDragOver={(event) => this.dragOverHandler(event)}
        className="drag-area">
        Drop a file here...
      </div>
      {this.state.items.length > 0 ? this.state.items.map((item) => {
        return (
          <div key={item.Name}>
            <h1>{item.Name}</h1>
            <h2>{item.Latitude}</h2>
            <h2>{item.Longitude}</h2>
            <p>{item.address}</p>
          </div>
        )
      }) : null}
    </main>
  }
}

export default App;
