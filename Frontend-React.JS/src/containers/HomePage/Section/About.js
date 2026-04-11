import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

class About extends Component {
    render() {
        return (
            <div className="section-share section-about">
                <div className="section-about-header">
                    <FormattedMessage id="homepage.about.title" />
                </div>
                <div className="section-about-content">
                    <div className="content-left">
                        <iframe
                            width="100%"
                            height="400px"
                            src="https://www.youtube.com/embed/qO3FlyihcSo"
                            title="BookingCare introduction"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                    <div className="content-right">
                        <p>
                            <FormattedMessage id="homepage.about.description" />
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default About;
