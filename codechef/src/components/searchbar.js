import React from 'react';
import './searchbar.css'
import Cookies from 'universal-cookie';

const pushState = (obj, url) => window.history.pushState(obj, '', url);
const onPopState = handler => {window.onpopstate = handler}

export default class SearchBar extends React.Component{
    constructor(props) {
        super(props)
        this.items = []
        this.contests = {}
        this.state = {
            suggestions: [],
            text: '',
            showchoice: false,
            show:false
        };
        this.loadedContest = {}
        this.problems = []
        this.getContest = this.getContest.bind(this);
        this.submit = this.submit.bind(this);
        this.div1 = this.div1.bind(this);
        this.div2 = this.div2.bind(this);
        this.start = this.start.bind(this);
    }

    async componentDidMount() {
        if (this.props.state.accessToken !== "") {
            //console.log(this.props.state.accessToken);
           await this.getContest();
        }
    }

    async getContest() {

        const cookies = new Cookies();
        const username = cookies.get('user');
        
        var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        var purl = "http://ec2-18-219-136-229.us-east-2.compute.amazonaws.com/backchef/?user="+username;
        const respons = await fetch(proxyUrl+purl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });
        const dat = await respons.json();
        const accessToken = dat['data']['access_token'];

        const url = "https://api.codechef.com/contests"
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` 
          }
        })
        const data = await response.json();
        //console.log(data);
        data['result']['data']['content']['contestList'].forEach(element => {

                this.contests[element['code']] = element['code']
                this.contests[element['name']] = element['code']
                this.items.push(element['code']);
                this.items.push(element['name']);
            
        });
    }

    onTextChanged = (e) => {
        let value = e.target.value;
        let suggestions = [];
        if (value.length > 0&&value.charAt(value.length-1)!=='\\') {
            const regex = new RegExp(`^${value}`,'i');
            suggestions = this.items.sort().filter(v => regex.test(v));
        }
        if (value === "")
            {this.setState(()=>({showchoice: false, show: false})) }
        this.setState(() => ({ suggestions,text :value }));
    }

    suggestionSelected(value) {
        this.setState(() => ({
            text: value,
            suggestions:[]
        }))
    }

    renderSuggestions() {
        const { suggestions } = this.state;
        if (suggestions.length === 0) {
            return null;
        }
        return (
            <ul>
                {suggestions.map((item) => <li onClick = {()=>this.suggestionSelected(item)}>{item}</li>)}
            </ul>
        )
    }

    async submit() {
        const cookies = new Cookies();
        const username = cookies.get('user');
        
        var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        var purl = "http://ec2-18-219-136-229.us-east-2.compute.amazonaws.com/backchef/?user="+username;
        const respons = await fetch(proxyUrl+purl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });
        const dat = await respons.json();
        const accessToken = dat['data']['access_token'];


        let cont = document.getElementById("contest").value;
        let code = this.contests[cont];
        if (code !== undefined) {

            try {
                const url = "https://api.codechef.com/contests/" + code;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
                const selectedContest = await response.json();
                //console.log(selectedContest);
                if (selectedContest['result']['data']['content']['children'].length !== 0) {
                    this.setState(pstate => {
                        return {
                            showchoice: true,
                            show: true
                        }
                    })
                    //console.log(this.state);
                }
                else {
                    this.setState(pstate => {
                        return {
                            showchoice: false,
                            show: true
                        }
                    })
                    this.loadedContest = selectedContest['result']['data']['content'];
                }
            }
            catch (e) {
                console.log(e);
                alert("Network issue please click again");
            }
        }
        else {
            console.log("failure");
        }
    }

    async div1() {

        const cookies = new Cookies();
        const username = cookies.get('user');
        
        var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        var purl = "http://ec2-18-219-136-229.us-east-2.compute.amazonaws.com/backchef/?user="+username;
        const respons = await fetch(proxyUrl+purl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });
        const dat = await respons.json();
        const accessToken = dat['data']['access_token'];


        let cont = document.getElementById("contest").value;
        let code = this.contests[cont] + "A";
        if (code !== undefined) {
            const url = "https://api.codechef.com/contests/" + code;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            const selectedContest = await response.json();
            this.loadedContest = selectedContest['result']['data']['content'];
            this.setState(pstate => {
                return {
                    showchoice: false,
                    show:true
                }
            })
        }
    }

    async div2() {
        const cookies = new Cookies();
        const username = cookies.get('user');
        
        var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        var purl = "http://ec2-18-219-136-229.us-east-2.compute.amazonaws.com/backchef/?user="+username;
        const respons = await fetch(proxyUrl+purl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });
        const dat = await respons.json();
        const accessToken = dat['data']['access_token'];


        let cont = document.getElementById("contest").value;
        let code = this.contests[cont] + "B";
        if (code !== undefined) {
            const url = "https://api.codechef.com/contests/" + code;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            const selectedContest = await response.json();
            this.loadedContest = selectedContest['result']['data']['content'];
            this.setState(pstate => {
                return {
                    showchoice: false,
                    show:true
                }
            })
        }
    }

    renderDivOps() {
        return (
            <div>
                <br />
                <br/>
                <hr/>
                <h3 className="choice">Please choose a division to start the contest ...</h3>
                <button className="division" onClick={this.div1}>Division 1</button>
                <button className = "division" onClick={this.div2}>Division 2</button>
            </div>
        );
    }

    renderStartButton() {
        return (
            <div>
                <br/>
                <br/>
                <hr/>
                <h3 className="choice">Click to Start the contest ...</h3>
                <button className = "division" onClick={this.start}>Start</button>
            </div>
        );
    }

    async getRanklist() {
        const cookies = new Cookies();
        const username = cookies.get('user');
        
        var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        var purl = "http://ec2-18-219-136-229.us-east-2.compute.amazonaws.com/backchef/?user="+username;
        const respons = await fetch(proxyUrl+purl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });
        const dat = await respons.json();
        const accessToken = dat['data']['access_token'];

        const url = "https://api.codechef.com/rankings/" + this.loadedContest['code'] ;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` 
          }
        })
        const data = await response.json()
        return data['result']['data']['content']
      }

    async start() {
        const cookies = new Cookies();
        const username = cookies.get('user');
        
        var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        var purl = "http://ec2-18-219-136-229.us-east-2.compute.amazonaws.com/backchef/?user="+username;
        const respons = await fetch(proxyUrl+purl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });
        const dat = await respons.json();
        const accessToken = dat['data']['access_token'];


        try {
            const ranklist = await this.getRanklist();
            let problemarray = []
            await Promise.all(
            
                this.loadedContest["problemsList"].map(async (problem) => {
                    const url = "https://api.codechef.com/contests/" + this.loadedContest['code'] + "/problems/" + problem["problemCode"];
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                    const data = await response.json();
                    problemarray[problem["problemCode"]] = data['result']['data']['content']
                    return data['result']['data']['content']
                }
                ));
        
            pushState(
                { contest: this.loadedContest['code'] },
                `/contest/${this.loadedContest['code']}`
            );
            //console.log(problemarray);
            this.props.handler(this.loadedContest, problemarray, ranklist);
        } catch (e)
        {
            alert("Network error please reload again!!");
        }
    }
    render() {
        const { text } = this.state;
        return (
                <div>
                <div className="searchbar">
                    <input value={text} onChange={this.onTextChanged} placeholder="Search Contests ..." type="search" id = "contest"/>
                    <button onClick={this.submit}>Submit</button>
                    {this.renderSuggestions()}
                </div>
                    {this.state.show===true?this.state.showchoice===true?this.renderDivOps():this.renderStartButton():<div/>}
                </div>
         )
      } 
}