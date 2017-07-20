import React from 'react';
import Gromit from 'gromit';


const request = async () => {
    const {data} = await Gromit().get('/src/data/file.json');
    console.log(data);
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
