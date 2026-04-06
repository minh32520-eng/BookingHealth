import React, { Component } from 'react';
import { connect } from 'react-redux';
import HomeHeader from './HomeHeader';
import Specialty from './Section/Specialty';
import MedicalFacillity from './Section/MedicalFacillity';
import OutStandingDoctor from './Section/OutStandingDoctor';
import HandBook from './Section/HandBook';
import './HomePage.scss';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import About from './Section/About';
import HomeFooter from './HomeFooter';
class HomePage extends Component {

    scrollToHash = () => {
        const hash = this.props.location && this.props.location.hash;
        if (!hash || hash.length < 2) return;
        const id = hash.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    componentDidMount() {
        this.scrollToHash();
    }

    componentDidUpdate(prevProps) {
        const prevHash = prevProps.location && prevProps.location.hash;
        const nextHash = this.props.location && this.props.location.hash;
        if (nextHash !== prevHash) {
            this.scrollToHash();
        }
    }

    render() {
        let settings = {
            infinite: false,
            dots: false,
            speed: 500,
            slidesToShow: 4,
            slidesToScroll: 1,
        };
        return (
            <div>
                <HomeHeader isShowBanner={true} />
                <div id="specialty-section">
                    <Specialty settings={settings} />
                </div>

                <div id="medical-facility-section">
                    <MedicalFacillity settings={settings} />
                </div>
                <div id="outstanding-doctor-section">
                    <OutStandingDoctor settings={settings} />
                </div>
                <div id="handbook-section">
                    <HandBook settings={settings} />
                </div>
                <div id="about-section">
                    <About />
                </div>
                <HomeFooter />
            </div >
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

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
