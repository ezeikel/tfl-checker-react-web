import React, { Component } from 'react';

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
        console.log(this.state.status);
        return (
            <div>
                <div>Status component works!</div>
                {
                    Object
                        .keys(this.state.status)
                        .map(line => <div key={this.state.status[line].id}><pre>{this.state.status[line].name}</pre></div>)
                }
            </div>
        )
    }
};

export default Status;