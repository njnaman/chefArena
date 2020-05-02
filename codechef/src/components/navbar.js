import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import './navbar.css'
import Cookies from 'universal-cookie';

const pushState = (obj, url) => window.history.pushState(obj, '', url);
const onPopState = handler => {window.onpopstate = handler}

class Navbar extends React.Component{
  constructor(props) {
      super(props);
      this.login = this.login.bind(this);
      //this.getUser = this.getUser.bind(this);
      this.state = {
        username: "Loading ...",
        rating: "1★"
      }
    }
  
  

  async componentDidMount() {
    const cookies = new Cookies();
    const username = cookies.get('user');
    
      var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      var url = "http://ec2-18-219-136-229.us-east-2.compute.amazonaws.com/backchef/?user=" + username;
      const response = await fetch(proxyUrl+url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      //console.log(data);
      if (data['data']['username'] !== null) {

        this.props.handler(data['data']['access_token']);
        this.setState(pstate => {
          return {
            username: data['data']['username'],
            rating: data['data']['band']
          }
        })
      }
    
    
    if (this.props.state.LoginStatus === false) {

      let query = window.location.search.substring(1);
      
      let auth_code = query.split("&")[0].split("=")[1];
      if (auth_code) {
        var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        var url = "http://ec2-18-219-136-229.us-east-2.compute.amazonaws.com/backchef/login?code="+auth_code;
        const response = await fetch(proxyUrl+url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const data = await response.json();
        //console.log(data);
        if (data['status'] === 'OK') {
          const cookies = new Cookies();
          cookies.set('user', data['data']['username'], { path: '/',maxAge: 31536000});
          this.props.handler(data['data']['access_token']);
            this.setState(pstate => {
            return {
              username: data['data']['username'],
              rating: data['data']['band']
            }
            })
          
          //window.location.href = "http://localhost:3000/";
        }

      }

    }
  }

  async login() {
    if (this.props.state.LoginStatus === false) {
       //redirect_uri%3Dhttps%3A%2F%2Fcodechefarena.herokuapp.com%2F
       //window.location.href = "https://api.codechef.com/oauth/authorize?response_type=code&client_id=91dc76170db3fdfec8cad0bfdee857f3&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&state=xyz";
       window.location.href = "https://api.codechef.com/oauth/authorize?response_type=code&client_id=91dc76170db3fdfec8cad0bfdee857f3&redirect_uri=https%3A%2F%2Fcodechefarena.herokuapp.com%2F&state=xyz";
       //window.location.href = "http://ec2-18-219-136-229.us-east-2.compute.amazonaws.com/backchef/login";
    }
    else {
      
      const cookies = new Cookies();
      var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      var url = "http://ec2-18-219-136-229.us-east-2.compute.amazonaws.com/backchef/logout?user="+cookies.get('user');
      await fetch(proxyUrl+url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      cookies.remove('user');
      this.props.handler("");
      pushState(
        {},
        `/`
    );
    onPopState(null);
    } 
  }

  getCss() {
  if (this.state.rating === "4") {
    return "star4";
  }
  else if (this.state.rating === "5") {
    return "star5";
  }
  else if (this.state.rating === "6") {
    return "star6";
  }
  else if (this.state.rating === "7") {
    return "star7";
  }
  else if (this.state.rating === "3") {
    return "star3";
  }
  else if (this.state.rating === "2") {
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