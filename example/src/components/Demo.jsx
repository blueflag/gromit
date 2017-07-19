import React from 'react';
import Gromit from 'gromit';


const request = async () => {
    var response = await Gromit({
        baseUrl: 'http://localhost:6822'
    })
        .get('jarvis/userpulse/no_of_users.son')
        .fetch()
        .catch(err => console.dir(err));

    console.log(response);
}

export default class Demo extends React.Component {

    componentDidMount() {
        request();
    }

    render() {
        return <div>
            Hello
        </div>

    }


}
