import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import './navbar.css'

class Navbar extends React.Component{
  constructor(props) {
      super(props);
      this.login = this.login.bind(this);
      this.getUser = this.getUser.bind(this);
      this.state = {
        username: "Loading ...",
        rating: "1★"
      }
    }
  
  
  async componentDidMount() {
    if(this.props.state.LoginStatus===false){
      let query = window.location.search.substring(1);
      
      let auth_code = query.split("&")[0].split("=")[1];
      if (auth_code) {
        const url = "https://api.codechef.com/oauth/token";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "grant_type": "authorization_code",
            'code': auth_code,
            "client_id": '91dc76170db3fdfec8cad0bfdee857f3',
            "client_secret": 'fc03abf96b50570a53b2c30d82695fa4',
            "redirect_uri": "https://codechefarena.herokuapp.com/"
          }),
        });
        const data = await response.json();
        console.log(data);
        
        if (data['result']['data']['access_token']!=="") {
          console.log("Logged in successfully");
          this.props.handler(data['result']['data']['access_token'], data['result']['data']['refresh_token']);
          let user = await this.getUser();
          this.setState(pstate => {
            return {
              username: user['content']['username'],
              rating: user['content']['band']
            }
          })
        }
      }
    }
  }

  async getUser() {
    const url = "https://api.codechef.com/users/me"
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.props.state.accessToken}`
      }
    })
    const data = await response.json();
    return data['result']['data'];
  }

  login() {
    if (this.props.state.LoginStatus === false) {
      //redirect_uri%3Dhttps%3A%2F%2Fcodechefarena.herokuapp.com%2F
      //window.location.href = "https://api.codechef.com/oauth/authorize?response_type=code&client_id=91dc76170db3fdfec8cad0bfdee857f3&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&state=xyz";
      window.location.href = "https://api.codechef.com/oauth/authorize?response_type=code&client_id=91dc76170db3fdfec8cad0bfdee857f3&redirect_uri=https%3A%2F%2Fcodechefarena.herokuapp.com%2F&state=xyz";
    }
    else {
      
      console.log("Logged out successfully");
      this.props.handler("","");
    } 
  }

  getCss() {
  if (this.state.rating === "4★") {
    return "star4";
  }
  else if (this.state.rating === "5★") {
    return "star5";
  }
  else if (this.state.rating === "6★") {
    return "star6";
  }
  else if (this.state.rating === "7★") {
    return "star7";
  }
  else if (this.state.rating === "3★") {
    return "star3";
  }
  else if (this.state.rating === "2★") {
    return "star2";
  }
  else {
    return "star1";
  }
}

  logoutState (){
    return (
      <div >
        <AppBar position="static" className="navbar">
          <Toolbar>            
            <div className="logo">
                Codechef Arena
            </div>
            <button className="login" onClick={this.login}>LOGIN</button>
          </Toolbar>
      </AppBar>
    </div>
    );
  }

  loginState() {
    return (
      <div >
        <AppBar position="static" className="navbar">
          <Toolbar>
            <div>
              <div className={this.getCss()}/>
            </div>
            <div className = "username">{this.state.username}</div>
            <div className="logo">
                Codechef Arena
            </div>
            <button className="login" onClick={this.login}>LOGOUT</button>
          </Toolbar>
        </AppBar>
        <div className = "responsive-page">

        </div>
    </div>
    );
  }

   render() {

    let comp
    if (this.props.state.LoginStatus === true) {
      comp = this.loginState()
    }
    else {
      comp = this.logoutState()
    }

    return comp;
  } 

}



export default Navbar