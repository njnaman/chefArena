import React from 'react'
import "./problemcard.css"

class Card extends React.Component{
    constructor(props) {
        super(props)
        this.questionSelected = this.questionSelected.bind(this)
    }
    questionSelected() {
        this.props.handler(this.props.prob["problemCode"]);
    }

    render() {
        let accuracy = String(this.props.prob["accuracy"]);
        let acc = accuracy.substr(0, 4);
        return (
            <div className = "card" onClick = {this.questionSelected}>
                <h3>Problem id: {this.props.prob["problemCode"]}</h3>
                <h3>Successful Submissions : {this.props.prob["successfulSubmissions"]}</h3>
                <h3>Accuracy: {acc}</h3>
            </div>
        )
    }
}

export default Card;