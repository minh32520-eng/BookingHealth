import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import './CustomScrollbars.scss';

class CustomScrollbars extends Component {

    constructor(props) {
        super(props);
        this.scrollRef = React.createRef();
    }

    getScrollTop = () => {
        if (!this.scrollRef.current) return 0;
        return this.scrollRef.current.getScrollTop();
    };

    getScrollLeft = () => {
        if (!this.scrollRef.current) return 0;
        return this.scrollRef.current.getScrollLeft();
    };

    scrollToBottom = () => {
        if (!this.scrollRef.current) return;
        this.scrollRef.current.scrollToBottom();
    };

    render() {
        const {
            className,
            children,
            disableVerticalScroll,
            disableHorizontalScroll,
            style,
            ...rest
        } = this.props;

        return (
            <Scrollbars
                ref={this.scrollRef}
                autoHide
                autoHideTimeout={200}
                hideTracksWhenNotNeeded
                style={{
                    width: '100%',
                    height: '100%',
                    ...style
                }}
                className={className ? `${className} custom-scrollbar` : 'custom-scrollbar'}
                renderTrackVertical={disableVerticalScroll ? () => <div /> : undefined}
                renderTrackHorizontal={disableHorizontalScroll ? () => <div /> : undefined}
                {...rest}
            >
                {children}
            </Scrollbars>
        );
    }
}

export default CustomScrollbars;
