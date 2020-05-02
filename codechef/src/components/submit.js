import React from 'react';
import "./submit.css"
import Cookies from 'universal-cookie';

export default class Submit extends React.Component{
    constructor(props) {
        super(props)
        this.run = this.run.bind(this);
    }

    async run() {
        const cookie = new Cookies();
        let user = cookie.get('user');
        let lang = document.getElementById("language");
        let language = lang.options[lang.selectedIndex].value;
        let code = document.getElementById("code").value;
        let inpta = document.getElementById("stdin").value;
        console.log(user);
        
        try {
            let formData = new FormData();
            formData.append('sourceCode', code);
            formData.append('language', 'C++14');
            formData.append('input', inpta);

            var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            var url = "ec2-18-219-136-229.us-east-2.compute.amazonaws.com/backchef/run?user="+user;
            const response = await fetch(proxyUrl+url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    //'Origin':'ec2-18-219-136-229.us-east-2.compute.amazonaws.com/backchef/'
                },
                body: formData,
            });
            const data = await response.json()

                console.log(data);
               // const outp = dat['result']['data']['output']
                //console.log(outp)
                document.getElementById("stdout").value = "The output is fetched but output is empty{printed in console}";

            

        }
        catch (e) {
            console.log(e);
        }
    }


    finalsubmit() {
        alert("Yay! Correct answer");
    }
    render() {
        const lang = [
            "C++ 6.3",
            "PAS gpc",
            "PERL",
            "PYTH",
            "FORT",
            "WSPC",
            "ADA",
            "CAML",
            "ICK",
            "JAVA",
            "C",
            "BF",
            "ASM",
            "CLPS",
            "PRLG",
            "ICON",
            "RUBY",
            "SCM qobi",
            "PIKE",
            "D",
            "HASK",
            "PAS fpc",
            "ST",
            "NICE",
            "LUA",
            "C#",
            "BASH",
            "PHP",
            "NEM",
            "LISP sbcl",
            "LISP clisp",
            "SCM guile",
            "JS",
            "ERL",
            "TCL",
            "SCALA",
            "SQL",
            "C++ 4.3.2",
            "C++14",
            "KTLN",
            "PERL6",
            "NODEJS",
            "TEXT",
            "swift",
            "rust",
            "SCM chicken",
            "PYPY",
            "PYPY3",
            "CLOJ",
            "GO",
            "PYTH 3.6",
            "R",
            "COB",
            "F#"
        ]
        const option = lang.map((element) => <option value={element}>{element}</option>)
        return (

                <div className="submitcode">
                <h2>Submission Window</h2>
                <p>Choose your language : <select name="language" id="language">{option}</select></p>
                <p>Paste your Code here: </p>
                <textarea name="code" id="code" cols="30" rows="10"></textarea>
                <p>Test your code here</p>
                
                <textarea name="testcase" id="stdin" cols="30" rows="10">input</textarea>
                               
                <textarea name="answer" id="stdout" cols="30" rows="10">output</textarea>
                <br/>
                <button onClick={this.run}>Run</button>
                <button onClick={this.finalsubmit}>Submit</button>
                </div> 
        )
    }
}