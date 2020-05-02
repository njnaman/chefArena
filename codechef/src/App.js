import React from 'react';
import './App.css';
import NavBar from './components/navbar'
import SearchBar from './components/searchbar'
import Contest from './components/contest'
import Submit from './components/submit'

const pushState = (obj, url) => window.history.pushState(obj, '', url);
const onPopState = handler => {window.onpopstate = handler}

class App extends React.Component {
  constructor(props)
  {
    super(props);
    
    this.state = {
      LoginStatus: false,
      accessToken: '',
      loadcontest:false
    }
    this.contests = {}
    this.problems = []
    this.ranklist = []
    this.loginStateHandler = this.loginStateHandler.bind(this);
    this.renderSearchComponent = this.renderSearchComponent.bind(this);
    this.contestStateHandler = this.contestStateHandler.bind(this);
    this.renderContestComponent = this.renderContestComponent.bind(this);
    this.renderNavBar = this.renderNavBar.bind(this);
    this.SearchContestToggle = this.SearchContestToggle.bind(this);
  }


  loginStateHandler(accessT) {

    if (this.state.LoginStatus) {
      this.setState(pstate => {
        return {
          LoginStatus: false,
          accessToken: '',
          loadcontest:false
        }
      })
    }
    else {
      pushState(
        { accestoken: accessT },
        `/`
      );
      
      this.setState(pstate => {
        return {
          LoginStatus: true,
          accessToken: accessT,
        }
      })
    }
  }

  
  contestStateHandler(contest,problem,ranklist) {
    if (this.state.LoginStatus) {
      this.contests = contest;
      this.problems = problem;
      this.ranklist = ranklist;
      //console.log(this.ranklist);
      this.setState(()=>({loadcontest:true}))
    }
  }

  renderSearchComponent() {
    if (this.state.loadcontest === false) {
      return (this.state.LoginStatus === true ? <div className="App-Component"><SearchBar state={this.state} handler={this.contestStateHandler}/></div>:<div/>);
      //return <div className="App-Component"><SearchBar state={this.state} handler={this.contestStateHandler}/></div> 
    }
  }

  SearchContestToggle() {
    this.setState((pstate)=>({loadcontest: !pstate.loadcontest}))
  }

  renderContestComponent() {
    if (this.state.loadcontest === true)
    { const stime = Date.parse(this.contests['startDate']);
      const etime = Date.parse(this.contests['endDate']);
      const timertime = new Date().getTime() + etime - stime;
      return <Contest contest={this.contests} ranklist={this.ranklist} problem={this.problems} togglehandler={this.SearchContestToggle} time={timertime} state={this.state}/>;
    }
  }



  renderNavBar() {
    return <NavBar state={this.state} handler={this.loginStateHandler} />
  }

  render() {

    return (
      <div>
      <div className="App">
        <NavBar state={this.state} handler={this.loginStateHandler} />
        {this.renderSearchComponent()}
        </div>
        {this.renderContestComponent()}
        </div>
    );
  }



}



export default App;



