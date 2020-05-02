import React from 'react';
import "./listelements.css"

export default class UserElement extends React.Component{
    constructor(props) {
        super(props)
    }

   // 
    render() {
        const ranklist = this.props.ranklist;
         const user = ranklist.map((element) =>
              <tr><td>{element['rank']}</td><td>{element['username']}</td><td>{element['rating']}</td><td>{element['totalScore']}</td></tr>
        );
        //console.log(this.props.ranklist);
        return (
            
            <table className="rank">
                <tr><th>Rank</th><th>Username</th><th>Rating</th><th>Score</th></tr>
                 {user}   
            </table>
        )
    }
}