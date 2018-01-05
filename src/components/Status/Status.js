import React, { Component } from 'react';

import "./Status.css";

import LineStatus from "./LineStatus/LineStatus";

class Status extends Component {
    state = {
        status: {}
    }

    async componentWillMount() {
        const data = await fetch('https://api.tfl.gov.uk/line/mode/tube/status');
        const json = await data.json();
        this.setState({status: json});
    }

    render() {
        return (
            <div>
                <h4>Status:</h4>
                <ul className="tfl-lines">
                    {
                        Object
                            .keys(this.state.status)
                            .map(line => <LineStatus key={this.state.status[line].id} line={this.state.status[line]} />)
                    }
                </ul>
            </div>
        )
    }
};

export default Status;