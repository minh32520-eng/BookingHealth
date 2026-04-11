import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

class HomeFooter extends Component {
    render() {
        return (
            <div className="home-footer">
                <p>
                    &copy; 2025 MinhF.{' '}
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://youtube.com/shorts/vKNAr45KeEs?si=hsRGmjvWbCSeZ-Sa"
                    >
                        <FormattedMessage id="homepage.footer.link" />
                    </a>
                </p>
            </div>
        );
    }
}

export default HomeFooter;
