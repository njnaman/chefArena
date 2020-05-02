import React from 'react'
import Timer from './timer'
import Card from './problemcard'
import "./contest.css"
import { Table } from '@material-ui/core';
import Problem from './conversion'
import User from './listelement'
import Submit from './submit'

const pushState = (obj, url) => window.history.pushState(obj, '', url);
const onPopState = handler => {window.onpopstate = handler}

class ContestPage extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            questionShow: false,
            score: 0,
            showPopup: false
        }
        this.loadques = ""
        this.questionHandler = this.questionHandler.bind(this);
        this.renderMaincontest = this.renderMaincontest.bind(this);
        this.endTest = this.endTest.bind(this);
        this.togglePopup = this.togglePopup.bind(this);
        
    }

    togglePopup() {
        this.setState({  
            showPopup: !this.state.showPopup  
       });  
    }

    endTest() {
        this.props.togglehandler();
        pushState(
            {},
            `/`
        );
        onPopState(null);
    }

    componentDidMount() {

            onPopState((event) => {
                if (event.state !== null)
                    this.setState({
                        questionShow: false
                    })
            })
    }

    questionHandler(problemCode) {
        this.loadques = problemCode;    
        this.setState(() => {
            return {
                questionShow: true,
            }
        }) 
    }



    renderMaincontest() {
        if (this.state.questionShow === false) {

            const problems = this.props.contest['problemsList'];
            const problemcard = problems.map((problem) =>
                <td><Card prob={problem} handler={this.questionHandler} /></td>
            );
            //console.log(this.props.ranklist);
            return (
                <div>
                    <div className="problems">
                        <table border="0" cellSpacing="20">
                            {problemcard}
                        </table>
                    </div>
                    <div>
                        <h1 className = "ttt">RANKLIST</h1>
                        <User ranklist={this.props.ranklist}/>
                    </div>
                </div>
            )
        }
        else {
            let mathbody = this.props.problem[this.loadques]['body'];
            pushState(
                { question: this.loadques },
                `/contest/${this.props.contest['code']}/${this.loadques}/`
            );
            let ishtml = /#/i.test(mathbody)
            if (ishtml === true) {
                mathbody = mathbody.replace(/<br\s*\/?>/gi, '\n');
                return (
                    <div>
                    <table>
                        <tr>
                            <td>
                                <div className="question">
                                    <hr />
                                    <br />
                                    <h1>{this.props.problem[this.loadques]['problemName']}</h1>
                                    <Problem source={mathbody} />
                                    <hr />
                                    <Submit accesstoken={this.props.state['accessToken']} />      
                                </div>
                            </td>

                        </tr>
                        </table>
                    </div>    
                )
            }
            else {
                return (
                    <div>
                    <table>
                        <tr>
                            <td>
                                <div className="question">
                                    <hr />
                                    <br />
                                    <h1>{this.props.problem[this.loadques]['problemName']}</h1>
                                    <div dangerouslySetInnerHTML={{__html:mathbody}}/>
                                    <hr />
                                    <Submit accesstoken={this.props.state['accessToken']} />  
                                </div>
                            </td>
                        </tr>
                        </table>
                        
                    </div>    
                )
            }
        }
    }

    render() {
        //console.log(this.props.ranklist);
        return (
            <div className="contest">
                <div className="cover">
                    <Table border="0" cellSpacing="50%">
                        <td><h1 className="heading">Contest: {this.props.contest['name']}</h1></td>
                        <td align="center"><button onClick={this.endTest}>End Test</button></td>
                        <td><Timer className="timer" startDate={this.props.time} /></td>
                    </Table>
                </div>
                <br />
                {this.renderMaincontest()}
            </div>
        )
    }
}

export default ContestPage;