import './App.css';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ParticlesBg from 'particles-bg'
import { useEffect, useState } from 'react';
// import Clarifai from './Clarifai';
import SignIn from './components/SignIn/Signin'
import Register from './components/Register/Register'

// const app = new Clarifai.App({
//   apiKey: '62a8284ed94c4b1891b6b46bf603591a'
// });
const App = () => {
  // console.log('Clarifi API',app)
  const [userInput, setUserInput] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [box, setBox] = useState({})
  const [route, setRoute] = useState('signin')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  })

  useEffect(() => {
    fetch('https://face-detection-backend-one.onrender.com')
  }, [])

  const onInputChange = (event) => setUserInput(event.target.value)

  const loadUser = (user) => {
    setUser({
      email: user.email,
      entries: user.entries,
      id: user.id,
      joined: user.joined,
      name: user.name
    })
  }

  const calculateFaceLocation = (data) => {
    // const clarifaiFace = data?.outputs[0].data.regions[0].region_info.bounding_box
    console.log(data, 'data')
    const clarifaiFace = data?.data.regions[0].region_info.bounding_box

    const image = document.getElementById('input_image')
    const width = Number(image.width)
    const height = Number(image.height)
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  const displayFaceBox = (box) => {
    setBox(box)
  }

  const onButtonSubmit = async () => {
    setImageUrl(userInput)

    // const response = await app?.models?.predict('53e1df302c079b3db8a0a36033ed2d15', userInput)
    // console.log('Response',response)
    // console.log('Response Data',response?.outputs[0]?.data?.regions[0]?.region_info?.bounding_box)
    // if (response.status == 200)
    //   displayFaceBox(calculateFaceLocation(response));
    // else
    //   console.log('API Failed')

    fetch('https://face-detection-backend-one.onrender.com/imageurl', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: userInput
      })
    })
      .then(response => {

        if (response) {
          fetch('http://localhost:3000/image', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: user.id
            })
          }).then(response => response.json())
            .then(count => {
              setUser(prev => ({ ...prev, entries: count }))
            })
        }
        return response.json()
      })
      .then(data => displayFaceBox(calculateFaceLocation(data)))
      .catch(err => console.log(err))

    console.log('Fetching the Image... ')
  }

  const onRouteChange = (route) => {
    if (route == 'signout')
      setIsSignedIn(false)
    else if (route == 'home')
      setIsSignedIn(true)
    setRoute(route)
  }

  return (
    <div className="App">
      <ParticlesBg color="#ffffff" type="cobweb" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      {
        route == 'home' ?
          <div>
            <Logo />
            <Rank name={user.name} entries={user.entries} />
            <ImageLinkForm onButtonSubmit={onButtonSubmit} onInputChange={onInputChange} userInput={userInput} />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div> :
          (
            route === 'signin' ? <SignIn loadUser={loadUser} onRouteChange={onRouteChange} /> : <Register loadUser={loadUser} onRouteChange={onRouteChange} />
          )
      }
    </div>
  );
}

export default App;
