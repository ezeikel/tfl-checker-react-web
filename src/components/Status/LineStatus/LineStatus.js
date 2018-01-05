import React from 'react';

const LineStatus = (props) => (
    <li className={props.line.id + ' line'}>
        <span>
            {props.line.name}
        </span>
        <span>
            {props.line.lineStatuses.map(status => status.statusSeverityDescription)}
        </span>
    </li>
)

export default LineStatus;
