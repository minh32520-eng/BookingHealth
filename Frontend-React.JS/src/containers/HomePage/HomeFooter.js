import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
class HomeFooter extends Component {

    render() {
        return (

            <div className="home-footer">
                <p>&copy; 2025 MinhF .<a target="_blank" href="https://youtube.com/shorts/vKNAr45KeEs?si=hsRGmjvWbCSeZ-Sa">More Information,please visit my youtube chanel. &#8594; Click here &#8592;</a></p>
            </div>
        );
    }
}


const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeFooter);
